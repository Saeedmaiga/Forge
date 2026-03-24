import { vi } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([]),
    $disconnect: vi.fn().mockResolvedValue(undefined),
  },
}));
