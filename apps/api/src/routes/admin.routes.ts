import type { FastifyInstance } from 'fastify';
import { authenticate, authorizeRole } from '../lib/middleware.js';

export function adminRoutes(server: FastifyInstance) {
  server.delete(
    '/admin-only',
    { preHandler: [authenticate, authorizeRole('ADMIN')] },
    (_req, reply) => {
      return reply.send({ message: 'Admin access granted' });
    },
  );
}
