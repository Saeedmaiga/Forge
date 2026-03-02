import { describe, it, expect, vi} from 'vitest';
import { buildServer } from '../server.js';

vi.mock('../services/user.service.js', () => ({
  createUser: vi.fn(),
  loginUser: vi.fn(),
  refreshUserToken: vi.fn(),
}));

describe('POST /auth/register', () => {
    it('returns 400 when email is missing', async () => {
      const server = buildServer();
      const res = await server.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { password: 'password123' },
      });
      expect(res.statusCode).toBe(400);
    });
  });