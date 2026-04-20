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
  unreadCount: number;
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
  const [unreadCount, setUnreadCount] = useState(0);
  
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

  // Calcular mensagens não lidas globalmente
  useEffect(() => {
    // Se as conversas tiverem informação de lastMessage e is_read (como no seu model)
    const count = conversations.reduce((acc, conv) => {
      const isUnread = conv.lastMessage && !conv.lastMessage.is_read && conv.lastMessage.sender_id !== user?.id;
      return acc + (isUnread ? 1 : 0);
    }, 0);
    setUnreadCount(count);
  }, [conversations, user?.id]);

  // Ouvir notificações globais do RealtimeContext para atualizar a lista de conversas
  useEffect(() => {
    const handleGlobalNewMessage = (e: any) => {
      const newMessage = e.detail;
      // Se recebermos uma mensagem de uma conversa que não é a ativa, refrescamos a lista
      if (newMessage.conversation_id !== activeConversationId) {
        refreshConversations();
      }
    };

    window.addEventListener('supabase-new-message', handleGlobalNewMessage);
    return () => window.removeEventListener('supabase-new-message', handleGlobalNewMessage);
  }, [activeConversationId, refreshConversations]);

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
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    refreshConversations(); // Atualiza a lista ao entrar na conversa

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
          setMessages((prev) => {
            if (prev.some(msg => msg.id === newMessage.id)) return prev; // Evita duplicados
            const updated = [...prev, newMessage];
            
            // Se o chat estiver aberto nesta conversa, marcar como lida no backend
            if (isChatOpen && activeConversationId === newMessage.conversation_id) {
              api.put(`/chat/messages/read`, { messageIds: [newMessage.id] }).catch(console.error);
              newMessage.is_read = true;
            }

            return updated;
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
      // 2.2. BROADCAST (Ultra-rápido): Recebe a mensagem via Websocket disparado pelo Backend
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
      conversations, messages, activeConversationId, isChatOpen, isLoadingMessages, unreadCount,
      setChatOpen, setActiveConversationId, startConversation, sendMessage, refreshConversations
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);