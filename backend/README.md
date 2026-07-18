# SevaApp Backend (serverless)

AWS Lambda + DynamoDB + API Gateway (HTTP API). Fully serverless, pay-per-request.

```
API Gateway (HTTP API, public)
        │  $default route
        ▼
   Lambda  (seva-api, Node 20)
        │
        ▼
   DynamoDB   seva-categories  ·  seva-services   (on-demand)
```

## Endpoints

Base URL = the API Gateway endpoint printed by `deploy.sh` (also in `.deploy-output.json`).

| Method | Path               | Auth        | Description                       |
|--------|--------------------|-------------|-----------------------------------|
| GET    | `/health`          | public      | Health check                      |
| GET    | `/bootstrap`       | public      | `{ categories, services }`        |
| GET    | `/categories`      | public      | `{ items }`                       |
| GET    | `/services`        | public      | `{ items }`                       |
| POST   | `/categories`      | `x-admin-key` | Create category                 |
| PUT    | `/categories/{id}` | `x-admin-key` | Upsert category                 |
| DELETE | `/categories/{id}` | `x-admin-key` | Delete category                 |
| POST   | `/services`        | `x-admin-key` | Create service                  |
| PUT    | `/services/{id}`   | `x-admin-key` | Upsert service                  |
| DELETE | `/services/{id}`   | `x-admin-key` | Delete service                  |

Reads are public (the data is public info and a mobile app can't hide a secret).
Writes require the `x-admin-key` header, whose value is the `ADMIN_KEY` Lambda env
var (generated on first deploy and saved to `backend/.env`, gitignored).

## Deploy

```bash
cd backend
npm install          # AWS SDK v3 (only needed for the local seed script)
./deploy.sh          # creates/updates all AWS resources; idempotent
node seed.mjs        # loads initial data (from ../src/data/services.ts)
```

`deploy.sh` provisions: 2 DynamoDB tables, an IAM role, the Lambda, an HTTP API
with a catch-all route, CORS, and public-invoke permission. It writes
`.deploy-output.json` (gitignored) with the API URL + admin key, used by
`seed.mjs` and by the admin app's `.env.local`.

> **Why API Gateway and not a Lambda Function URL?** Many AWS accounts now enable
> account-level *Block Public Access* for Lambda URLs, which returns 403 even with
> a correct resource policy. HTTP APIs are public by default and sidestep this.

## Notes

- Region defaults to `us-east-1` (override with `AWS_REGION`).
- The Lambda ships only `src/handler.mjs`; the Node 20 runtime provides AWS SDK v3.
- `seed.mjs` transpiles the mobile app's `services.ts` so the seed never drifts
  from the app's bundled fallback data.

## Tear down

```bash
aws lambda delete-function --function-name seva-api
aws apigatewayv2 delete-api --api-id <apiId>            # from .deploy-output.json
aws dynamodb delete-table --table-name seva-categories
aws dynamodb delete-table --table-name seva-services
aws iam delete-role-policy --role-name seva-api-role --policy-name seva-ddb-access
aws iam detach-role-policy --role-name seva-api-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name seva-api-role
```
