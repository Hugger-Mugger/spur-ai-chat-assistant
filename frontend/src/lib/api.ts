/**
 * API Client Library
 * Handles communication with the backend endpoints
 */

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3001';

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
 * 🚀 PRODUCTION FIX: Minifier glitch hatane ke liye clean explicit throw lagaya hai
 */
export async function sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
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
      let errorMessage = 'Network pipeline error';
      try {
        const error = (await response.json()) as ApiError;
        errorMessage = `${error.error}: ${error.message}`;
      } catch (_) {}
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as ChatResponse;
    return data;
  } catch (error: any) {
    // 🚀 CRITICAL: Logs alag aur throw alag, koi linear chaining nahi taaki compiler pagal na bane
    const errorString = error?.message || 'Unknown API Exception';
    console.error('❌ Chat pipeline error trace:', errorString);
    throw new Error(errorString);
  }
}

/**
 * Fetch conversation history for a given session
 * 🚀 PRODUCTION FIX: Empty fallback array to keep UI safe on initial mount
 */
export async function getConversationHistory(sessionId: string): Promise<HistoryMessage[]> {
  try {
    if (!sessionId) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return []; 
    }

    const data = (await response.json()) as HistoryMessage[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('⚠️ History pipeline bypassed silently');
    return []; 
  }
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}