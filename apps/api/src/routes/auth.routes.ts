
import type { FastifyInstance } from 'fastify';
import { createUser, loginUser, refreshUserToken } from '../services/user.service.js';
import { AppError } from '../lib/errors.js';

export async function authRoutes(server: FastifyInstance) {
    server.post('/register',{
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
    }, async (req, reply) => {
      const body = req.body as {
        email: string;
        password: string;
        name?: string | null;
      };
      if (!body.email || !body.password) {
        throw new AppError('VALIDATION_ERROR', 'Email and password are required', 400);
      }
      const user = await createUser(body);
      return reply.status(201).send(user);
    });
  
    server.post( '/login', {
        config: {
          rateLimit: {
            max: 5,
            timeWindow: '1 minute',
          },
        },
      },
      async (req, reply) => {
        const body = req.body as {
          email: string;
          password: string;
        };
    
        const tokens = await loginUser(body.email, body.password);
        return reply.status(200).send(tokens);
      },
    );

    server.post('/refresh', async (req, reply) => {
      const body = req.body as { refreshToken: string };
      if (!body.refreshToken) {
        throw new AppError('VALIDATION_ERROR', 'Refresh token is required', 400);
      }
      const tokens = await refreshUserToken(body.refreshToken);
      return reply.status(200).send(tokens);
    });
  }