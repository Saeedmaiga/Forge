import { createDocument, getUserDocuments, deleteDocument } from '../services/document.service.js';
import { authenticate } from '../lib/middleware.js';
import { createDocumentSchema, documentIdParamsSchema } from '../lib/validators/document.validator.js';

export default async function documentRoutes(server: any) {
  server.post(
    '/documents',
    { preHandler: authenticate },
    async (req: any, reply: any) => {
        const body = createDocumentSchema.parse(req.body);

        const doc = await createDocument(req.user.userId, body);
      return reply.status(201).send(doc);
    },
  );

  server.get(
    '/documents',
    { preHandler: authenticate },
    async (req: any) => {
      return getUserDocuments(req.user.userId);
    },
  );

  server.delete(
    '/documents/:id',
    { preHandler: authenticate },
    async (req: any) => {
        const params = documentIdParamsSchema.parse(req.params);
      return deleteDocument(req.user.userId, params.id);
    },
  );
}