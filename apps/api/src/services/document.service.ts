import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

export async function createDocument(
  userId: string,
  data: { title: string; content: string }
) {
  return prisma.document.create({
    data: {
      title: data.title,
      content: data.content,
      ownerId: userId,
    },
  });
}

export async function getUserDocuments(
    userId: string,
    options: { page: number; limit: number }
  ) {
    const { page, limit } = options;
  
    const skip = (page - 1) * limit;
  
    return prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

export async function deleteDocument(userId: string, documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!doc) {
    throw new AppError('NOT_FOUND', 'Document not found', 404);
  }

  if (doc.ownerId !== userId) {
    throw new AppError('FORBIDDEN', 'Not your document', 403);
  }

  await prisma.document.delete({
    where: { id: documentId },
  });

  return { success: true };
}