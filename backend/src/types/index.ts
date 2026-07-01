export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}