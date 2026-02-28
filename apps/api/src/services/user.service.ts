import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/hash.js';
import { AppError } from '../lib/errors.js';

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