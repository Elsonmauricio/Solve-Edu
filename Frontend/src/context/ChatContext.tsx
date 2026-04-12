import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import api from '../services/api';
import { useApp } from './AppContext';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  lastMessage?: Message;
}

interface ChatContextData {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  isChatOpen: boolean;
  isLoadingMessages: boolean;
  setChatOpen: (open: boolean) => void;
  setActiveConversationId: (id: string | null) => void;
  startConversation: (targetUserId: string) => Promise<string>;
  sendMessage: (content: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextData>({} as ChatContextData);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Ref para guardar o canal atual e evitar vazamento de memória nas subscrições
  const channelRef = useRef<any>(null);

  const refreshConversations = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get('/chat/conversations');
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    }
  }, [user]);

  // Efeito principal: Carregar mensagens e subscrever ao Realtime
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    // 1. Carregar histórico inicial via API
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await api.get(`/chat/${activeConversationId}/messages`);
        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        toast.error('Não foi possível carregar as mensagens.');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    // 2. Subscrever ao Supabase Realtime (Websockets)
    // Filtramos eventos INSERT na tabela Message especificamente para esta conversa
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel(`chat_room:${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Adicionar mensagem ao estado local instantaneamente
          setMessages((prev) => {
            if (prev.some(msg => msg.id === newMessage.id)) return prev; // Evita duplicados
            return [...prev, newMessage];
          });
        }
      )
      // Escutar atualizações de mensagens (ex: quando são marcadas como lidas)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Message', filter: `conversation_id=eq.${activeConversationId}` },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        }
      )
      // 2.2. Broadcast: Recebe a mensagem instantaneamente via Websocket
      .on(
        'broadcast',
        { event: 'new-message' },
        (payload) => {
          const newMessage = payload.payload as Message;
          setMessages((prev) => 
            prev.some(msg => msg.id === newMessage.id) ? prev : [...prev, newMessage]
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [activeConversationId]);

  const startConversation = async (targetUserId: string) => {
    const response = await api.post('/chat/start', { targetUserId });
    if (response.data.success) {
      await refreshConversations();
      return response.data.conversationId;
    }
    throw new Error('Falha ao iniciar conversa');
  };

  const sendMessage = async (content: string) => {
    if (!activeConversationId) return;
    
    try {
      const response = await api.post('/chat/send', { conversationId: activeConversationId, content });
      if (response.data.success && response.data.data) {
        const sentMessage = response.data.data;
        // Adição otimista com verificação de duplicados (caso o realtime seja mais rápido)
        setMessages((prev) => 
          prev.some(msg => msg.id === sentMessage.id) ? prev : [...prev, sentMessage]
        );
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Falha ao enviar mensagem');
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations, messages, activeConversationId, isChatOpen, isLoadingMessages,
      setChatOpen, setActiveConversationId, startConversation, sendMessage, refreshConversations
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);