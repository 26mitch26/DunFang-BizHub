import { request } from '@umijs/max';

export interface AgentChatRequest {
  question: string;
  context?: Record<string, any>;
}

export async function agentChat(data: AgentChatRequest) {
  return request<API.Result<{ answer: string }>>('/api/ai/agent/chat', {
    method: 'POST',
    data,
  });
}
