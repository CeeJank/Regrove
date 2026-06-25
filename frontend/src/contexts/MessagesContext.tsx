import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message } from '../types';

interface MessagesContextType {
  messages: Message[];
  sendMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  getConversation: (userA: string, userB: string) => Message[];
<<<<<<< HEAD
  getRecentContacts: (userId: string) => string[];
=======
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
<<<<<<< HEAD
  const [messages] = useState<Message[]>([]);

  const sendMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    throw new Error('Messaging backend not implemented.');
=======
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      senderId: 'worker-1',
      receiverId: 'child-1',
      content: 'Hi Alex, how are you feeling today?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'text',
    },
    {
      id: 'msg-2',
      senderId: 'child-1',
      receiverId: 'worker-1',
      content: "I'm doing okay, a bit stressed about school.",
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      type: 'text',
    },
    {
      id: 'msg-3',
      senderId: 'worker-1',
      receiverId: 'child-1',
      content: "That's understandable. Let's talk about it in our session.",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'text',
    },
  ]);

  const sendMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMsg: Message = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
  };

  const getConversation = (userA: string, userB: string) =>
    messages
<<<<<<< HEAD
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
=======
      .filter(
        m =>
          (m.senderId === userA && m.receiverId === userB) ||
          (m.senderId === userB && m.receiverId === userA)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <MessagesContext.Provider value={{ messages, sendMessage, getConversation }}>
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages must be used within MessagesProvider');
  return ctx;
<<<<<<< HEAD
};
=======
};
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
