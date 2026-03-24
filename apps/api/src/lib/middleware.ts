import type { FastifyRequest } from 'fastify';
import { AppError } from './errors.js';
import { verifyAccessToken } from './auth.js';

export function authenticate(req: FastifyRequest) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 'Missing token', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError('UNAUTHORIZED', 'Malformed token', 401);
  }
  const payload = verifyAccessToken(token);
  req.user = payload;
}

export function authorizeRole(requiredRole: string) {
  return (req: FastifyRequest) => {
    if (!req.user || req.user.role !== requiredRole) {
      throw new AppError('FORBIDDEN', 'Insufficient permissions', 403);
    }
  };
}
