#!/usr/bin/env bash
# Provision / update the SevaApp serverless backend using the AWS CLI.
# Idempotent: safe to run repeatedly. Creates DynamoDB tables, an IAM role,
# the Lambda function and a public Function URL, then prints the URL + admin key.
#
# Requires: aws cli configured, zip, node.
set -euo pipefail

# ---- Config ----
REGION="${AWS_REGION:-us-east-1}"
PREFIX="seva"
CATEGORIES_TABLE="${PREFIX}-categories"
SERVICES_TABLE="${PREFIX}-services"
CONFIG_TABLE="${PREFIX}-config"
ROLE_NAME="${PREFIX}-api-role"
FUNCTION_NAME="${PREFIX}-api"
RUNTIME="nodejs20.x"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
echo "▶ Account $ACCOUNT_ID / region $REGION"

# ---- Admin key (persisted locally, never committed) ----
ENV_FILE="$HERE/.env"
if [[ -f "$ENV_FILE" ]] && grep -q '^ADMIN_KEY=' "$ENV_FILE"; then
  ADMIN_KEY="$(grep '^ADMIN_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2-)"
  echo "▶ Reusing existing ADMIN_KEY from backend/.env"
else
  ADMIN_KEY="$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'))")"
  echo "ADMIN_KEY=$ADMIN_KEY" > "$ENV_FILE"
  echo "▶ Generated new ADMIN_KEY (saved to backend/.env)"
fi

# ---- DynamoDB tables ----
create_table() {
  local name="$1"
  if aws dynamodb describe-table --table-name "$name" --region "$REGION" >/dev/null 2>&1; then
    echo "  ✓ table $name exists"
  else
    echo "  + creating table $name"
    aws dynamodb create-table \
      --table-name "$name" \
      --attribute-definitions AttributeName=id,AttributeType=S \
      --key-schema AttributeName=id,KeyType=HASH \
      --billing-mode PAY_PER_REQUEST \
      --region "$REGION" >/dev/null
    aws dynamodb wait table-exists --table-name "$name" --region "$REGION"
    echo "  ✓ table $name active"
  fi
}
echo "▶ DynamoDB"
create_table "$CATEGORIES_TABLE"
create_table "$SERVICES_TABLE"
create_table "$CONFIG_TABLE"

# ---- IAM role ----
echo "▶ IAM role"
TRUST='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  echo "  ✓ role $ROLE_NAME exists"
else
  echo "  + creating role $ROLE_NAME"
  aws iam create-role --role-name "$ROLE_NAME" \
    --assume-role-policy-document "$TRUST" >/dev/null
  aws iam attach-role-policy --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole >/dev/null
  echo "  ⏳ waiting for role to propagate"
  sleep 12
fi

# (Re)attach a scoped DynamoDB policy each run so table changes are reflected.
DDB_POLICY=$(cat <<JSON
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["dynamodb:Scan","dynamodb:GetItem","dynamodb:PutItem","dynamodb:DeleteItem","dynamodb:BatchWriteItem"],
    "Resource": [
      "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${CATEGORIES_TABLE}",
      "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${SERVICES_TABLE}",
      "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${CONFIG_TABLE}"
    ]
  }]
}
JSON
)
aws iam put-role-policy --role-name "$ROLE_NAME" \
  --policy-name "${PREFIX}-ddb-access" \
  --policy-document "$DDB_POLICY" >/dev/null
echo "  ✓ DynamoDB access policy attached"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

# ---- Package Lambda (runtime provides the AWS SDK v3, so only ship src) ----
echo "▶ Packaging Lambda"
rm -f function.zip
( cd src && zip -q -r ../function.zip handler.mjs )

ENV_VARS="Variables={CATEGORIES_TABLE=$CATEGORIES_TABLE,SERVICES_TABLE=$SERVICES_TABLE,CONFIG_TABLE=$CONFIG_TABLE,ADMIN_KEY=$ADMIN_KEY}"

# ---- Create or update the function ----
echo "▶ Lambda function"
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" >/dev/null 2>&1; then
  echo "  ↻ updating code"
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://function.zip \
    --region "$REGION" >/dev/null
  aws lambda wait function-updated --function-name "$FUNCTION_NAME" --region "$REGION"
  echo "  ↻ updating config"
  aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --environment "$ENV_VARS" \
    --handler "handler.handler" --runtime "$RUNTIME" --timeout 15 --memory-size 256 \
    --region "$REGION" >/dev/null
  aws lambda wait function-updated --function-name "$FUNCTION_NAME" --region "$REGION"
else
  echo "  + creating function"
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime "$RUNTIME" \
    --handler "handler.handler" \
    --role "$ROLE_ARN" \
    --zip-file fileb://function.zip \
    --timeout 15 --memory-size 256 \
    --environment "$ENV_VARS" \
    --region "$REGION" >/dev/null
  aws lambda wait function-active --function-name "$FUNCTION_NAME" --region "$REGION"
fi

# ---- Public HTTP API (API Gateway v2) ----
# We front the Lambda with an HTTP API rather than a Function URL: many accounts
# now have account-level "Block Public Access" for Lambda URLs (returns 403 even
# with a correct resource policy), whereas HTTP APIs are public by default.
echo "▶ API Gateway (HTTP API)"
LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"
API_NAME="${PREFIX}-http-api"
CORS_CFG='AllowOrigins=[*],AllowMethods=[*],AllowHeaders=[content-type,x-admin-key],MaxAge=86400'

API_ID="$(aws apigatewayv2 get-apis --region "$REGION" \
  --query "Items[?Name=='${API_NAME}'].ApiId | [0]" --output text)"
if [[ "$API_ID" == "None" || -z "$API_ID" ]]; then
  echo "  + creating HTTP API"
  API_ID="$(aws apigatewayv2 create-api --name "$API_NAME" --protocol-type HTTP \
    --cors-configuration "$CORS_CFG" --region "$REGION" --query ApiId --output text)"
else
  echo "  ✓ HTTP API exists ($API_ID)"
  aws apigatewayv2 update-api --api-id "$API_ID" \
    --cors-configuration "$CORS_CFG" --region "$REGION" >/dev/null
fi

# Integration (AWS_PROXY, payload format 2.0)
INTEG_ID="$(aws apigatewayv2 get-integrations --api-id "$API_ID" --region "$REGION" \
  --query 'Items[0].IntegrationId' --output text)"
if [[ "$INTEG_ID" == "None" || -z "$INTEG_ID" ]]; then
  INTEG_ID="$(aws apigatewayv2 create-integration --api-id "$API_ID" \
    --integration-type AWS_PROXY --integration-uri "$LAMBDA_ARN" \
    --payload-format-version 2.0 --integration-method POST \
    --region "$REGION" --query IntegrationId --output text)"
fi
# Always (re)assert the correct integration URI — guards against a mangled ARN.
aws apigatewayv2 update-integration --api-id "$API_ID" --integration-id "$INTEG_ID" \
  --integration-uri "$LAMBDA_ARN" --region "$REGION" >/dev/null

# Catch-all default route -> integration
ROUTE_ID="$(aws apigatewayv2 get-routes --api-id "$API_ID" --region "$REGION" \
  --query "Items[?RouteKey=='\$default'].RouteId | [0]" --output text)"
if [[ "$ROUTE_ID" == "None" || -z "$ROUTE_ID" ]]; then
  aws apigatewayv2 create-route --api-id "$API_ID" --route-key '$default' \
    --target "integrations/${INTEG_ID}" --region "$REGION" >/dev/null
fi

# $default auto-deploy stage
if ! aws apigatewayv2 get-stage --api-id "$API_ID" --stage-name '$default' --region "$REGION" >/dev/null 2>&1; then
  aws apigatewayv2 create-stage --api-id "$API_ID" --stage-name '$default' \
    --auto-deploy --region "$REGION" >/dev/null
fi

# Permission for API Gateway to invoke the Lambda
aws lambda add-permission --function-name "$FUNCTION_NAME" \
  --statement-id apigw-invoke --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*" \
  --region "$REGION" >/dev/null 2>&1 || true

API_URL="$(aws apigatewayv2 get-api --api-id "$API_ID" --region "$REGION" --query ApiEndpoint --output text)"
API_URL="${API_URL%/}"

# ---- Save outputs for the seed script & admin app ----
cat > "$HERE/.deploy-output.json" <<JSON
{
  "region": "$REGION",
  "apiUrl": "$API_URL",
  "apiId": "$API_ID",
  "categoriesTable": "$CATEGORIES_TABLE",
  "servicesTable": "$SERVICES_TABLE",
  "configTable": "$CONFIG_TABLE",
  "adminKey": "$ADMIN_KEY"
}
JSON

rm -f function.zip

echo ""
echo "══════════════════════════════════════════════════════════════"
echo " ✅ Backend deployed"
echo "   API URL : $API_URL"
echo "   Admin key (keep secret): $ADMIN_KEY"
echo ""
echo "   Next:  node seed.mjs      # load initial data into DynamoDB"
echo "   Outputs saved to backend/.deploy-output.json (gitignored)"
echo "══════════════════════════════════════════════════════════════"
