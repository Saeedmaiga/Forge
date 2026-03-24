import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
});

export const documentIdParamsSchema = z.object({
  id: z.string().min(1, 'Document id is required'),
});