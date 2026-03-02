import { describe, it, expect, vi } from 'vitest';
import { buildServer } from '../server.js';

// Mock prisma so no real DB is needed
vi.mock('../lib/prisma.js', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
}));

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const server = buildServer();
    const res = await server.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });
});