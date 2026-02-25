import crypto from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import { AppError } from './lib/errors.js';


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