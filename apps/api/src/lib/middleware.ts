import Fastify, { type FastifyRequest } from 'fastify';
import { AppError } from './errors.js';
import { verifyAccessToken } from './auth.js';

export async function authenticate(req: FastifyRequest & { user?: any }) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 'Missing token', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError('UNAUTHORIZED', 'Malformed token', 401);
  }
  const payload = verifyAccessToken(token);
  (req as any).user = payload;
}

export function authorizeRole(requiredRole: string) {
  return async (req: any) => {
    if (!req.user || req.user.role !== requiredRole) {
      throw new AppError('FORBIDDEN', 'Insufficient permissions', 403);
    }
  };
}