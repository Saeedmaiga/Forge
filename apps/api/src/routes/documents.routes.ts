import type { FastifyInstance, FastifyReply } from 'fastify';
import { createDocument, getUserDocuments, deleteDocument } from '../services/document.service.js';
import { authenticate } from '../lib/middleware.js';
import { createDocumentSchema, documentIdParamsSchema } from '../lib/validators/document.validator.js';
import { AppError } from '../lib/errors.js';

function requireUserId(req: { user?: { userId: string } }): string {
  const id = req.user?.userId;
  if (id === undefined) {
    throw new AppError('UNAUTHORIZED', 'Missing user', 401);
  }
  return id;
}

export default function documentRoutes(server: FastifyInstance) {
  server.post(
    '/documents',
    { preHandler: authenticate },
    async (req, reply: FastifyReply) => {
      const body = createDocumentSchema.parse(req.body);
      const userId = requireUserId(req);
      const doc = await createDocument(userId, body);
      return reply.status(201).send(doc);
    },
  );

  server.get(
    '/documents',
    { preHandler: authenticate },
    async (req, reply: FastifyReply) => {
      const query = req.query as Record<string, string | undefined>;
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
      const userId = requireUserId(req);
      const docs = await getUserDocuments(userId, { page, limit });
      return reply.send(docs);
    },
  );

  server.delete(
    '/documents/:id',
    { preHandler: authenticate },
    async (req, reply: FastifyReply) => {
      const params = documentIdParamsSchema.parse(req.params);
      const userId = requireUserId(req);
      const result = await deleteDocument(userId, params.id);
      return reply.send(result);
    },
  );
}
