import { Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/databaseService';
import LLMService from '../services/llmService';

export const handleChatMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, sessionId } = req.body;

    // === DEFENSIVE LAYER: Input Sanitization ===
    let cleanMessage = (message || '').trim();
    if (cleanMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // === LAZY SESSION RESOLVER ===
    // FIX #1: Use truthiness check instead of string comparison
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const newConversation = await databaseService.createConversation();
      activeSessionId = newConversation.id;
      console.log(`🆕 Created new conversation: ${activeSessionId}`);
    } else {
      console.log(`✅ Using existing conversation: ${activeSessionId}`);
    }

    // === CHAT HISTORY INGESTION (BEFORE adding user message)
    // FIX #2: Fetch history BEFORE persisting to avoid ordering coupling
    const priorMessages = await databaseService.getConversationHistory(activeSessionId);
    const contextHistory = priorMessages.map(msg => ({
      sender: msg.sender,
      text: msg.text
    }));
    console.log(`📚 Context window includes ${contextHistory.length} previous messages`);

    // === SAVE USER MESSAGE ===
    await databaseService.addMessage(activeSessionId, 'USER', cleanMessage);
    console.log(`💾 Persisted user message to conversation ${activeSessionId}`);

    // === ENCAPSULATED LLM PIPELINE CALL ===
    console.log(`🤖 Calling LLM with context...`);
    const aiResponseText = await LLMService.generateReply(contextHistory, cleanMessage);

    // === SAVE AI RESPONSE ===
    await databaseService.addMessage(activeSessionId, 'AI', aiResponseText);
    console.log(`💾 Persisted AI response to conversation ${activeSessionId}`);

    // === SUCCESS CONTRACT API PAYLOAD ===
    return res.status(200).json({
      reply: aiResponseText,
      sessionId: activeSessionId
    });

  } catch (error) {
    console.error('❌ Chat handler error:', error);
    next(error);
  }
};
