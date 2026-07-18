// SevaApp API — single Lambda behind a Function URL.
//
// Public (no auth):
//   GET  /                      health check
//   GET  /categories            list all categories
//   GET  /services              list all services
//   GET  /bootstrap             { categories, services } in one call (used by app)
//
// Admin (requires header  x-admin-key: <ADMIN_KEY>):
//   POST   /categories          create (body = category)         -> {item}
//   PUT    /categories/{id}      upsert category with that id     -> {item}
//   DELETE /categories/{id}      delete category
//   POST   /services            create (body = service)          -> {item}
//   PUT    /services/{id}        upsert service with that id      -> {item}
//   DELETE /services/{id}        delete service
//
// DynamoDB tables are passed in via env: CATEGORIES_TABLE, SERVICES_TABLE.
// The admin secret is passed in via env: ADMIN_KEY.

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const CATEGORIES_TABLE = process.env.CATEGORIES_TABLE;
const SERVICES_TABLE = process.env.SERVICES_TABLE;
const ADMIN_KEY = process.env.ADMIN_KEY;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,x-admin-key',
  'Access-Control-Max-Age': '86400',
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS },
    body: JSON.stringify(body),
  };
}

function tableFor(resource) {
  if (resource === 'categories') return CATEGORIES_TABLE;
  if (resource === 'services') return SERVICES_TABLE;
  return null;
}

async function scanAll(table) {
  const items = [];
  let ExclusiveStartKey;
  do {
    const out = await ddb.send(
      new ScanCommand({ TableName: table, ExclusiveStartKey })
    );
    items.push(...(out.Items ?? []));
    ExclusiveStartKey = out.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function requireAdmin(event) {
  const headers = event.headers ?? {};
  const key = headers['x-admin-key'] ?? headers['X-Admin-Key'];
  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    throw new HttpError(401, 'Unauthorized');
  }
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method ?? 'GET';
  const rawPath = event.rawPath ?? '/';
  const path = rawPath.replace(/\/+$/, '') || '/';
  const segments = path.split('/').filter(Boolean); // e.g. ['services','svc_1']

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  try {
    // ---- Public reads ----
    if (method === 'GET') {
      if (path === '/' || path === '/health') {
        return json(200, { ok: true, service: 'seva-api', time: new Date().toISOString() });
      }
      if (path === '/bootstrap') {
        const [categories, services] = await Promise.all([
          scanAll(CATEGORIES_TABLE),
          scanAll(SERVICES_TABLE),
        ]);
        categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return json(200, { categories, services });
      }
      if (segments.length === 1) {
        const table = tableFor(segments[0]);
        if (!table) throw new HttpError(404, 'Not found');
        const items = await scanAll(table);
        if (segments[0] === 'categories') items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return json(200, { items });
      }
      throw new HttpError(404, 'Not found');
    }

    // ---- Admin writes ----
    requireAdmin(event);

    const resource = segments[0];
    const table = tableFor(resource);
    if (!table) throw new HttpError(404, 'Not found');

    if (method === 'POST') {
      const body = parseBody(event);
      const item = { ...body, id: body.id || `${resource === 'services' ? 'svc' : 'cat'}_${randomUUID().slice(0, 8)}` };
      item.updatedAt = new Date().toISOString();
      await ddb.send(new PutCommand({ TableName: table, Item: item }));
      return json(201, { item });
    }

    if (method === 'PUT') {
      const id = segments[1];
      if (!id) throw new HttpError(400, 'Missing id');
      const body = parseBody(event);
      const item = { ...body, id, updatedAt: new Date().toISOString() };
      await ddb.send(new PutCommand({ TableName: table, Item: item }));
      return json(200, { item });
    }

    if (method === 'DELETE') {
      const id = segments[1];
      if (!id) throw new HttpError(400, 'Missing id');
      // confirm it exists for a clean 404 vs silent success
      const existing = await ddb.send(new GetCommand({ TableName: table, Key: { id } }));
      if (!existing.Item) throw new HttpError(404, 'Item not found');
      await ddb.send(new DeleteCommand({ TableName: table, Key: { id } }));
      return json(200, { deleted: id });
    }

    throw new HttpError(405, 'Method not allowed');
  } catch (err) {
    if (err instanceof HttpError) {
      return json(err.status, { error: err.message });
    }
    console.error('Unhandled error', err);
    return json(500, { error: 'Internal error' });
  }
};
