import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return res.status(400).json({
      error: 'Validation Error',
      message: messages,
      statusCode: 400,
    } as ApiError);
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: 'Error',
      message: err.message,
      statusCode: err.statusCode,
    } as ApiError);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    // @ts-ignore - Prisma error code access
    if (err.code === 'P2003') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Referenced record does not exist',
        statusCode: 404,
      } as ApiError);
    }
  }

  // Log unexpected errors for debugging
  console.error('💥 Unexpected Error:', err);

  // Return generic error for unknown errors (don't leak stack traces)
  return res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
  } as ApiError);
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};