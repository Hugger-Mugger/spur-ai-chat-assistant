/**
 * API Client Library
 * Handles communication with the backend /chat/message endpoint
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface HistoryMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string; // ISO string from backend
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Send a chat message to the backend
 * @param message - The user's message text
 * @param sessionId - Optional existing session ID
 * @throws {ApiError} If the request fails
 */
export async function sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
      } as ChatRequest),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(`${error.error}: ${error.message}`);
    }

    const data = (await response.json()) as ChatResponse;
    return data;
  } catch (error) {
    console.error('❌ Chat API error:', error);
    throw error;
  }
}

/**
 * Fetch conversation history for a given session
 * @param sessionId - The session ID to fetch history for
 * @returns Array of messages sorted chronologically
 * @throws {Error} If the request fails
 */
export async function getConversationHistory(sessionId: string): Promise<HistoryMessage[]> {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/history/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(`${error.error}: ${error.message}`);
    }

    const data = (await response.json()) as HistoryMessage[];
    return data;
  } catch (error) {
    console.error('❌ History fetch error:', error);
    throw error;
  }
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
