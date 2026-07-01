import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler, AppError } from './middleware/errorHandler';
import { validate, chatRequestSchema } from './middleware/validation';
import { HealthResponse } from './types';
import { handleChatMessage } from './controllers/chatController';
import { handleGetHistory } from './controllers/historyController';

const app = express();
const router = Router();

// Middleware
app.use(cors({
  origin: 'https://spur-ai-chat-assistant.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle CORS Preflight globally before any router
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
router.get('/health', (_req: Request, res: Response<HealthResponse>) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint - wired directly with lazy session logic
router.post(
  '/chat/message',
  validate(chatRequestSchema),
  handleChatMessage
);

// History endpoint - fetch past messages for a conversation
router.get('/chat/history/:sessionId', handleGetHistory);

// Use router
app.use('/api', router);

// 404 handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Route not found', 404));
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Health check: http://localhost:${config.port}/api/health`);
  console.log(`💬 Chat endpoint: POST http://localhost:${config.port}/api/chat/message`);
});

export default app;
