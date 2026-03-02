import type { FastifyInstance } from 'fastify';
import { authenticate, authorizeRole } from '../lib/middleware.js';

export async function adminRoutes(server: FastifyInstance) {
  server.delete(
    '/admin-only',
    { preHandler: [authenticate, authorizeRole('ADMIN')] },
    async () => {
      return { message: 'Admin access granted' };
    }
  );
}