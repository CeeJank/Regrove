import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message } from '../types';

interface MessagesContextType {
  messages: Message[];
  sendMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  getConversation: (userA: string, userB: string) => Message[];
  getRecentContacts: (userId: string) => string[];
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const [messages] = useState<Message[]>([]);

  const sendMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    throw new Error('Messaging backend not implemented.');
  };

  const getConversation = (userA: string, userB: string) =>
    messages
      .filter(m =>
        (m.senderId === userA && m.receiverId === userB) ||
        (m.senderId === userB && m.receiverId === userA)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const getRecentContacts = (userId: string) => {
    const contactSet = new Set<string>();
    messages
      .filter(m => m.senderId === userId || m.receiverId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .forEach(m => {
        const other = m.senderId === userId ? m.receiverId : m.senderId;
        contactSet.add(other);
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
