import Fastify from 'fastify';
import cors from '@fastify/cors';

import { openDatabase, cardCount, DB_PATH } from './db/schema.js';
import { ensureDatabase } from './db/ingest.js';
import { registerCardRoutes } from './routes/cards.js';

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '0.0.0.0';

async function main(): Promise<void> {
  const ingestOnly = process.argv.includes('--ingest-only');
  console.log(`[api] Opening DB at ${DB_PATH}`);
  const db = openDatabase();
  await ensureDatabase(db);
  console.log(`[api] Ready with ${cardCount(db)} cards`);

  if (ingestOnly) {
    db.close();
    return;
  }

  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });

  app.get('/health', async () => ({
    ok: true,
    cards: cardCount(db),
  }));

  await registerCardRoutes(app, db);

  await app.listen({ port: PORT, host: HOST });
  console.log(`[api] Listening on http://localhost:${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
