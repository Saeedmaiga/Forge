import crypto from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import { AppError } from './lib/errors.js';
import { prisma } from './lib/prisma.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import documentRoutes from './routes/documents.routes.js';
import { ZodError } from 'zod';
import rateLimit from '@fastify/rate-limit';


export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Failed to connect to database');
    process.exit(1); // Crash immediately
  }
}


export function buildServer(): FastifyInstance {
  const server = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
    genReqId: () => crypto.randomUUID(),
  });

 

  server.addHook('onRequest', async (req) => {
    // store start time on the request
    (req as any).startTime = Date.now();
    req.log.info({ method: req.method, url: req.url }, 'request:start');
  });

  server.addHook('onResponse', async (req, reply) => {
    const start = (req as any).startTime ?? Date.now();
    const durationMs = Date.now() - start;

    req.log.info(
      { method: req.method, url: req.url, statusCode: reply.statusCode, durationMs },
      'request:done',
    );
  });

  server.setErrorHandler((err, req, reply) => {
    const requestId = req.id;
    if (err instanceof ZodError) {
      req.log.warn({ err }, 'validation:error');
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: err.flatten(),
          requestId,
        },
      });
    }

  
    // Known AppError (our own)
    if (err instanceof AppError) {
      req.log.warn({ err }, 'app:error');
      return reply.status(err.statusCode).send({
        error: {
          code: err.code,
          message: err.message,
          requestId,
        },
      });
    }
  
    // Unknown error (unexpected)
    req.log.error({ err }, 'unhandled:error');
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
        requestId,
      },
    });
  });

  server.get('/health', async (req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch {
      return reply.status(503).send({
        status: 'error',
        message: 'Database unavailable',
      });
    }
  });


  server.get('/boom', async () => {
    throw new Error('boom');
  });

  server.decorateRequest('user', null);

  server.register(authRoutes, { prefix: '/auth' });
  server.register(userRoutes, { prefix: '/user' });
  server.register(adminRoutes, { prefix: '/admin' });
  server.register(documentRoutes, { prefix: '/documents' });

  return server;
}