import type { FastifyInstance } from 'fastify';
import { authenticate } from '../lib/middleware.js';

export async function userRoutes(server: FastifyInstance) {
  server.get('/me', { preHandler: authenticate }, async (req: any) => {
    return {
      message: 'Protected route',
      user: req.user,
    };
  });
}