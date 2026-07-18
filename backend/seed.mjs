// Seed DynamoDB with the initial SevaApp data.
//
// To avoid maintaining the directory twice, this reads the mobile app's own
// data file (../src/data/services.ts), transpiles it in-memory with the
// TypeScript compiler (a dev dependency at the repo root), and imports the
// resulting `categories` and `services` arrays.
//
// Usage:  node seed.mjs           (uses backend/.deploy-output.json for config)

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { readFileSync, writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ---- Load deploy config ----
let cfg;
try {
  cfg = JSON.parse(readFileSync(join(__dirname, '.deploy-output.json'), 'utf8'));
} catch {
  console.error('✗ backend/.deploy-output.json not found. Run ./deploy.sh first.');
  process.exit(1);
}
const REGION = cfg.region || process.env.AWS_REGION || 'us-east-1';

// ---- Transpile the app's data file and import it ----
async function loadData() {
  const ts = require(join(__dirname, '..', 'node_modules', 'typescript'));
  const tsPath = join(__dirname, '..', 'src', 'data', 'services.ts');
  const source = readFileSync(tsPath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: 'ESNext', target: 'ES2020' },
  });
  const dir = mkdtempSync(join(tmpdir(), 'seva-seed-'));
  const outFile = join(dir, 'services.mjs');
  writeFileSync(outFile, outputText);
  return import(pathToFileURL(outFile).href);
}

// ---- DynamoDB batch write (25 items per request) ----
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});

async function batchWrite(table, items) {
  for (let i = 0; i < items.length; i += 25) {
    const chunk = items.slice(i, i + 25);
    let requestItems = {
      [table]: chunk.map((Item) => ({ PutRequest: { Item } })),
    };
    // handle unprocessed items with simple retry
    for (let attempt = 0; attempt < 5; attempt++) {
      const out = await ddb.send(new BatchWriteCommand({ RequestItems: requestItems }));
      const unprocessed = out.UnprocessedItems?.[table];
      if (!unprocessed || unprocessed.length === 0) break;
      requestItems = { [table]: unprocessed };
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
}

async function main() {
  const mod = await loadData();
  const categories = mod.categories.map((c, i) => ({ ...c, order: i }));
  const services = mod.services;

  console.log(`▶ Seeding ${categories.length} categories → ${cfg.categoriesTable}`);
  await batchWrite(cfg.categoriesTable, categories);

  console.log(`▶ Seeding ${services.length} services → ${cfg.servicesTable}`);
  await batchWrite(cfg.servicesTable, services);

  console.log('✅ Seed complete.');
}

main().catch((e) => {
  console.error('✗ Seed failed:', e);
  process.exit(1);
});
