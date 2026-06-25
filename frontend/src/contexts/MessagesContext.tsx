import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Message } from '../types';
import { useAuth } from './AuthContext';
import { useCases } from './CasesContext';
import { apiFetch } from '../services/api';
import { fetchConversations, fetchMessages } from '../services/youthChatApi';

interface MessagesContextType {
  messages: Message[];
  sendMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  getConversation: (userA: string, userB: string) => Message[];
  getRecentContacts: (userId: string) => string[];
}

interface ConversationListItem {
  conversation_id: number;
  youth_id?: number;
  worker_id?: number | null;
}

interface ApiMessage {
  message_id: number;
  conversation_id: number;
  sender_type: string;
  sender_id?: number | null;
  receiver_id?: number | null;
  message: string;
  created_at: string;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { allChildren, allWorkers } = useCases();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);

  const workerProfileId = user ? allWorkers[user.id]?.profileId ?? null : null;
  const childProfileId = user ? allChildren[user.id]?.profileId ?? null : null;

  const visibleConversations = useMemo(() => {
    if (!user) return [];
    if (user.role === 'social_worker') {
      return conversations.filter((conversation) => String(conversation.worker_id ?? '') === workerProfileId);
    }
    return conversations.filter((conversation) => String(conversation.youth_id ?? '') === childProfileId);
  }, [childProfileId, conversations, user, workerProfileId]);

  const refreshMessages = async (conversationRows: ConversationListItem[]) => {
    const relevantMessages = await Promise.all(
      conversationRows.map((conversation) => fetchMessages(conversation.conversation_id))
    );

    const mapped = relevantMessages
      .flat()
      .filter((message) => message.sender_type !== 'AI')
      .map((message: ApiMessage) => ({
        id: String(message.message_id),
        senderId: String(message.sender_id ?? ''),
        receiverId: String(message.receiver_id ?? ''),
        content: message.message,
        timestamp: message.created_at,
        type: 'text' as const,
      }));

    setMessages(mapped);
  };

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setConversations([]);
      return;
    }

    if (user.role === 'social_worker' && !workerProfileId) return;
    if (user.role === 'child' && !childProfileId) return;

    let cancelled = false;

    const load = async () => {
      try {
        const allConversations = await fetchConversations();
        if (cancelled) return;

        const filtered = user.role === 'social_worker'
          ? allConversations.filter((conversation) => String(conversation.worker_id ?? '') === workerProfileId)
          : allConversations.filter((conversation) => String(conversation.youth_id ?? '') === childProfileId);

        setConversations(filtered);
        await refreshMessages(filtered);
      } catch {
        if (!cancelled) {
          setConversations([]);
          setMessages([]);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [childProfileId, user, workerProfileId]);

  const ensureConversation = async (senderId: string, receiverId: string) => {
    if (!user) throw new Error('Not authenticated');

    const existing = visibleConversations.find((conversation) => {
      if (user.role === 'social_worker') {
        const otherProfileId = allChildren[receiverId]?.profileId ?? receiverId;
        return String(conversation.youth_id ?? '') === String(otherProfileId);
      }

      const otherProfileId = allWorkers[receiverId]?.profileId ?? receiverId;
      return String(conversation.worker_id ?? '') === String(otherProfileId);
    });

    if (existing) return existing.conversation_id;

    const youthProfileId = user.role === 'child'
      ? allChildren[senderId]?.profileId
      : allChildren[receiverId]?.profileId;
    const resolvedWorkerProfileId = user.role === 'social_worker'
      ? allWorkers[senderId]?.profileId
      : allWorkers[receiverId]?.profileId;

    if (!youthProfileId || !resolvedWorkerProfileId) {
      throw new Error('Unable to resolve conversation participants.');
    }

    const created = await apiFetch<{ conversation_id: number; youth_id?: number; worker_id?: number | null }>('/conversations', {
      method: 'POST',
      body: JSON.stringify({
        userId: Number(youthProfileId),
        workerId: Number(resolvedWorkerProfileId),
      }),
    });

    const nextConversations = [...conversations, created];
    setConversations(nextConversations);
    return { conversationId: created.conversation_id, nextConversations };
  };

  const sendMessage = async (msg: Omit<Message, 'id' | 'timestamp'>) => {
    if (!user) throw new Error('Not authenticated');

    const conversationResult = await ensureConversation(msg.senderId, msg.receiverId);
    const conversationId = typeof conversationResult === 'number'
      ? conversationResult
      : conversationResult.conversationId;

    if (user.role === 'social_worker') {
      const workerProfile = allWorkers[msg.senderId];
      await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          senderType: 'worker',
          workerId: Number(workerProfile?.profileId),
          message: msg.content,
        }),
      });
    } else {
      await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          userId: Number(msg.senderId),
          message: msg.content,
          forceAi: false,
        }),
      });
    }

    const nextConversationSet = typeof conversationResult === 'number'
      ? conversations
      : conversationResult.nextConversations;
    await refreshMessages(nextConversationSet);
  };

  const getConversation = (userA: string, userB: string) =>
    messages
      .filter((message) =>
        (message.senderId === userA && message.receiverId === userB) ||
        (message.senderId === userB && message.receiverId === userA)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const getRecentContacts = (userId: string) => {
    const contactSet = new Set<string>();
    messages
      .filter((message) => message.senderId === userId || message.receiverId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .forEach((message) => {
        const other = message.senderId === userId ? message.receiverId : message.senderId;
        if (other) contactSet.add(other);
      });
    return Array.from(contactSet);
  };

  return (
    <MessagesContext.Provider value={{ messages, sendMessage, getConversation, getRecentContacts }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages must be used within MessagesProvider');
  return ctx;
};
