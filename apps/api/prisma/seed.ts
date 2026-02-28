import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Argon2 is much faster to code but harder for hackers to break
  const passwordHash = await argon2.hash('password123');

  const user = await prisma.user.upsert({
    where: { email: 'saeed@forge.com' },
    update: {},
    create: {
      email: 'saeed@forge.com',
      passwordHash: passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Seed successful: Created/Updated user', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });