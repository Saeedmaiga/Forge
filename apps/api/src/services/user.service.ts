import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/hash.js';
import { AppError } from '../lib/errors.js';
import { verifyPassword } from '../lib/hash.js';
import { generateAccessToken, generateRefreshToken } from '../lib/token.js';

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
  } catch (err: any) {
    // Defensive check in case of race condition
    if (err.code === 'P2002') {
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
  
    return {
      accessToken,
      refreshToken,
    };
  }