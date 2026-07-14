import type { FastifyInstance } from 'fastify';
import type Database from 'better-sqlite3';

import { getCardById } from '../db/card-mapper.js';
import { searchCards } from '../search/query.js';

export async function registerCardRoutes(
  app: FastifyInstance,
  db: Database.Database,
): Promise<void> {
  app.get<{
    Querystring: { q?: string; page?: string; order?: string; unique?: string };
  }>('/cards/search', async (req, reply) => {
    const q = (req.query.q ?? '').trim();
    if (!q) {
      return reply.code(400).send({
        object: 'error',
        code: 'bad_request',
        status: 400,
        details: 'You must provide a q search parameter.',
      });
    }

    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const result = searchCards(db, q, page, req.query.order);

    if (result.total_cards === 0) {
      return reply.code(404).send({
        object: 'error',
        code: 'not_found',
        status: 404,
        details: 'Your query didn’t match any cards.',
      });
    }

    return {
      object: 'list',
      total_cards: result.total_cards,
      has_more: result.has_more,
      data: result.data,
    };
  });

  app.get<{ Params: { id: string } }>('/cards/:id', async (req, reply) => {
    const card = getCardById(db, req.params.id);
    if (!card) {
      return reply.code(404).send({
        object: 'error',
        code: 'not_found',
        status: 404,
        details: 'No card with that id was found.',
      });
    }
    return card;
  });
}
