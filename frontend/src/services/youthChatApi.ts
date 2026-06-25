const API_BASE = "http://localhost:5000";

export interface ConversationListItem {
  conversation_id: number;
  youth_id?: number;
  worker_id?: number | null;
  youth_name: string;
  youth_age?: number | null;
  youth_school?: string | null;
  youth_interests?: string | null;
  youth_category?: string | null;
  youth_status?: string | null;
  worker_name: string | null;
  status: string;
  mode: "ai" | "human" | string;
  needs_handover: boolean;
  risk_level: string;
  last_message_at: string;
  created_at?: string;
}

export interface ChatMessage {
  message_id: number;
  conversation_id: number;
  sender_type: string;
  sender_id?: number | null;
  message: string;
  created_at: string;
}

export interface SummaryItem {
  summary_id: number;
  conversation_id: number;
  summary: string;
  created_at: string;
}

async function requestJson<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

export function fetchConversations() {
  return requestJson<ConversationListItem[]>("/api/conversations");
}

export function fetchConversation(conversationId: number) {
  return requestJson<ConversationListItem>(`/api/conversations/${conversationId}`);
}

export function fetchMessages(conversationId: number) {
  return requestJson<ChatMessage[]>(`/api/messages/${conversationId}`);
}

export function sendYouthMessage(
  conversationId: number,
  userId: number,
  message: string,
  forceAi: boolean
) {
  return requestJson<{
    mode: string;
    message: string;
    youthMessage: ChatMessage;
    aiReply: ChatMessage | null;
    riskLevel?: "low" | "medium" | "high";
    needsUrgentReview?: boolean;
  }>("/api/messages", {
    method: "POST",
    body: JSON.stringify({
      conversationId,
      userId,
      message,
      forceAi,
    }),
  });
}

export function sendWorkerMessage(
  conversationId: number,
  message: string,
  workerId?: number | null
) {
  return requestJson<{
    mode: string;
    message: string;
    workerMessage: ChatMessage;
    aiReply: ChatMessage | null;
  }>("/api/messages", {
    method: "POST",
    body: JSON.stringify({
      conversationId,
      workerId,
      senderType: "worker",
      message,
    }),
  });
}

export function fetchHandoverConversations() {
  return requestJson<ConversationListItem[]>("/api/workers/handover");
}

export function markHandoverReviewed(conversationId: number) {
  return requestJson<{
    message: string;
    reviewedReports: number;
    conversation: {
      conversation_id: number;
      status: string;
      mode: string;
      needs_handover: boolean;
    };
  }>(`/api/workers/handover/${conversationId}/reviewed`, {
    method: "PATCH",
  });
}

export function createSummary(conversationId: number) {
  return requestJson<{
    message: string;
    transcript: string;
    summary: SummaryItem;
    riskLevel: "low" | "medium" | "high";
    recommendedAction: string;
    suggestedOpeningMessage: string;
  }>(`/api/summaries/${conversationId}`, {
    method: "POST",
  });
}

export function fetchSummaries(conversationId: number) {
  return requestJson<SummaryItem[]>(`/api/summaries/${conversationId}`);
}
