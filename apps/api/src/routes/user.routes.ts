import type { FastifyInstance, FastifyReply } from 'fastify';
import { authenticate } from '../lib/middleware.js';

export function userRoutes(server: FastifyInstance) {
  server.get(
    '/me',
    { preHandler: authenticate },
    (req, reply: FastifyReply) => {
      return reply.send({
        message: 'Protected route',
        user: req.user,
      });
    },
  );
}
