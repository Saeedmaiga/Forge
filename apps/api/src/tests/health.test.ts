import { describe, it, expect } from 'vitest';
import { buildServer } from '../server.js';

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const server = buildServer();
    const res = await server.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
    await server.close();
  });
});
