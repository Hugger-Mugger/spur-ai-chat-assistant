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
 * 🚀 FIX: Hated /api prefix kyunki Express routes straight hain
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
  } catch (error) {
    console.error('❌ Chat API error:', error);
    throw error;
  }
}

/**
 * Fetch conversation history for a given session
 * 🚀 FIX: Removed /api prefix and enhanced JSON parsing safety
 */
export async function getConversationHistory(sessionId: string): Promise<HistoryMessage[]> {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return []; // Crash karne ke bajay empty array return karo taaki Svelte safe rahe
    }

    const data = (await response.json()) as HistoryMessage[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ History fetch error:', error);
    return []; // Return empty array on network failure to prevent blank screen
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