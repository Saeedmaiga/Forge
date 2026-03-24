import type { JwtPayload } from '../lib/auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number;
    user?: JwtPayload;
  }
}
