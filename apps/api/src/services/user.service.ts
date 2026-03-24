import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { generateAccessToken, generateRefreshToken } from '../lib/token.js';
import { hashPassword, verifyPassword, hashToken, verifyTokenHash } from '../lib/hash.js';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — must match JWT_REFRESH_EXPIRES

interface CreateUserInput {
  email: string;
  password: string;
  name?: string | null;
}

export async function createUser(input: CreateUserInput) {
  const { email, password, name } = input;

  // Check if email already exists (UX layer)
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new AppError('EMAIL_ALREADY_EXISTS', 'Email already registered', 409);
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
      },
    });

    // Return safe DTO
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  } catch (err: unknown) {
    // Defensive check in case of race condition
    if (
      err !== null &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: string }).code === 'P2002'
    ) {
      throw new AppError('EMAIL_ALREADY_EXISTS', 'Email already registered', 409);
    }
    throw err;
  }
}

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    }
  
    const valid = await verifyPassword(password, user.passwordHash);
  
    if (!valid) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    }
  
    const payload = {
      userId: user.id,
      role: user.role,
    };
  
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const tokenHash = await hashToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
      userId: user.id,
      tokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
    });

    return {
      accessToken,
      refreshToken,
    };
}

export async function refreshUserToken(token: string) {
  const storedTokens = await prisma.refreshToken.findMany({
    where: { expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  let matchedToken = null;
  for (const stored of storedTokens) {
    const valid = await verifyTokenHash(token, stored.tokenHash);
    if (valid) {
      matchedToken = stored;
      break;
    }
  }

  if (!matchedToken) {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired refresh token', 401);
  }

  await prisma.refreshToken.delete({ where: { id: matchedToken.id } });

  const payload = { userId: matchedToken.user.id, role: matchedToken.user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const tokenHash = await hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: matchedToken.user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { accessToken, refreshToken };
}