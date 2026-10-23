import api from './api';
import { API_BASE_URL } from '../../config/constants';

export class AIChatError extends Error {
  constructor(code, message, status = null) {
    super(message);
    this.name = 'AIChatError';
    this.code = code;
    this.status = status;
  }
}

// Same behaviour as the axios interceptor in api.js, which a fetch() call bypasses.
const handleUnauthorized = () => {
  localStorage.removeItem('sw_token');
  localStorage.removeItem('sw_user');
  window.location.href = '/login';
};

// Parses an SSE byte stream and calls onEvent(event, data) for every message.
const readEventStream = async (body, onEvent) => {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const event = block.match(/^event: (.+)$/m)?.[1] || 'message';
      const data = block.match(/^data: (.+)$/m)?.[1];
      if (!data) continue;
      try {
        onEvent(event, JSON.parse(data));
      } catch (err) {
        console.warn('Skipping malformed AI stream event:', err);
      }
    }
  }
};

export const aiTutorService = {
  getStatus: () => api.get('/ai/status'),
  getConversations: (params = {}) => api.get('/ai/conversations', { params }),
  getConversation: (id) => api.get(`/ai/conversations/${id}`),
  renameConversation: (id, title) => api.patch(`/ai/conversations/${id}`, { title }),
  deleteConversation: (id) => api.delete(`/ai/conversations/${id}`),

  // Practice quizzes. Generation waits for Gemini, so it gets a longer timeout than API_TIMEOUT.
  createQuiz: (payload) => api.post('/ai/practice/quizzes', payload, { timeout: 120000 }),
  getQuizzes: (params = {}) => api.get('/ai/practice/quizzes', { params }),
  getQuiz: (id) => api.get(`/ai/practice/quizzes/${id}`),
  submitQuiz: (id, answers) => api.post(`/ai/practice/quizzes/${id}/submit`, { answers }),

  /**
   * Sends a question and streams the answer.
   * @param {{ conversationId?: string, message?: string, inputMode?: string,
   *   attachment?: { mimeType: string, data: string }, subject?: string, context?: object }} payload
   * @param {{ signal?: AbortSignal, onEvent: (event: string, data: object) => void }} options
   */
  streamChat: async (payload, { signal, onEvent }) => {
    const token = localStorage.getItem('sw_token');
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      if (res.status === 401) handleUnauthorized();
      let data = {};
      try {
        data = await res.json();
      } catch {
        // non-JSON error body
      }
      throw new AIChatError(data.code || 'HTTP_ERROR', data.message || 'Something went wrong. Please try again.', res.status);
    }
    if (!res.body) throw new AIChatError('NO_STREAM', 'Your browser could not read the answer. Please try again.');
    await readEventStream(res.body, onEvent);
  },
};

export default aiTutorService;
