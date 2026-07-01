import { Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/databaseService';
import { AppError } from '../middleware/errorHandler';

// UUID v4 regex pattern for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const handleGetHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    // === UUID VALIDATION ===
    if (!sessionId || !UUID_REGEX.test(sessionId)) {
      return next(new AppError('Invalid session ID format', 400));
    }

    // === FETCH CONVERSATION HISTORY ===
    const messages = await databaseService.getConversationHistory(sessionId);
    console.log(`📜 Retrieved ${messages.length} messages for session ${sessionId}`);

    // === MAP TO API RESPONSE FORMAT ===
    const mappedMessages = messages.map(msg => ({
      id: msg.id,
      sender: msg.sender as 'USER' | 'AI',
      text: msg.text,
      timestamp: msg.timestamp.toISOString()
    }));

    // === RETURN SUCCESS RESPONSE ===
    return res.status(200).json(mappedMessages);

  } catch (error) {
    console.error('❌ History handler error:', error);
    next(error);
  }
};
