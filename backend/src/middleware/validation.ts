import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './errorHandler';

// Zod schema for chat message input
export const chatRequestSchema = z.object({
  message: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message is too long (max 4000 characters)'),
  sessionId: z.string().uuid('Invalid session ID format').nullable().optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('📋 Validating request body:', req.body);
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        console.log('❌ Validation failed:', result.error.issues);
        const message = result.error.issues
          .map(e => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        return next(new AppError(message, 400));
      }
      
      console.log('✅ Validation passed');
      req.body = result.data;
      next();
    } catch (error) {
      console.error('❌ Validation error:', error);
      next(error);
    }
  };
};
