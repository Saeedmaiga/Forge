import type { FastifyInstance } from 'fastify';
import { buildServer, checkDatabaseConnection } from './server.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

let app: FastifyInstance | undefined;

async function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  await app?.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => {
  void gracefulShutdown();
});
process.on('SIGTERM', () => {
  void gracefulShutdown();
});

const start = async () => {
  try {
    app = buildServer();
    await checkDatabaseConnection();
    await app.listen({
      port: Number(env.PORT),
      host: '0.0.0.0',
    });
    console.log('API IS RUNNING ON PORT 3000');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
