import crypto from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import { AppError } from './lib/errors.js';
import { prisma } from './lib/prisma.js';


export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Failed to connect to database');
    process.exit(1); // Crash immediately
  }
}

async function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

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

  server.get('/health', async () => {
    return { status: 'ok' };
  });

  server.get('/boom', async () => {
    throw new Error('boom');
  });

  return server;
}