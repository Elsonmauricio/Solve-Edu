import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from './AppContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  participants: any[]; // Simplificado para o exemplo
  lastMessage?: Message;
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (content: string, receiverId?: string) => Promise<void>;
  startConversation: (targetUserId: string) => Promise<string>;
  loading: boolean;
  isChatOpen: boolean;
  setChatOpen: (isOpen: boolean) => void;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Carregar Conversas do Utilizador
  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await api.get('/chat/conversations');
        if (response.data.success) {
          setConversations(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
      }
      setLoading(false);
    };

    fetchConversations();
  }, [user?.id]);

  // 2. Carregar Mensagens da Conversa Ativa e Subscrever Realtime
  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/chat/${activeConversationId}/messages`);
        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    };

    fetchMessages();

    // Subscrição Realtime para MENSAGENS desta conversa
    const channel = supabase
      .channel(`chat:${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId]);

  // 3. Subscrição GLOBAL para Notificações e Contagem de Não Lidas
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('global-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          // Nota: O filtro ideal seria receiver_id, mas como a tabela não tem, 
          // confiamos no RLS ou filtramos no cliente se necessário.
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Ignorar mensagens enviadas por mim mesmo
          if (newMessage.sender_id === user.id) return;

          // Se o chat estiver fechado OU se estivermos noutra conversa
          if (!isChatOpen || activeConversationId !== newMessage.conversation_id) {
            setUnreadCount((prev) => prev + 1);
            
            // Tentar encontrar o nome do remetente na lista de conversas carregadas
            const conversation = conversations.find(c => c.id === newMessage.conversation_id);
            const sender = conversation?.participants.find((p: any) => p.id === newMessage.sender_id);
            const senderName = sender?.name || 'Alguém';

            toast(`Nova mensagem de ${senderName}`, { icon: '💬' });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isChatOpen, activeConversationId, conversations]);

  // 4. Função para Iniciar Conversa (ou obter existente)
  const startConversation = async (targetUserId: string): Promise<string> => {
    if (!user?.id) throw new Error("User not logged in");

    try {
      const response = await api.post('/chat/start', { targetUserId });
      if (response.data.success) {
        // Recarregar conversas para atualizar a lista
        // (Numa versão melhor, adicionaríamos apenas a nova conversa ao estado)
        return response.data.conversationId;
      }
      throw new Error(response.data.message);
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      throw error;
    }
  };

  // 5. Enviar Mensagem
  const sendMessage = async (content: string, receiverId?: string) => {
    if (!user?.id) return;

    let conversationId = activeConversationId;

    if (!conversationId && receiverId) {
      conversationId = await startConversation(receiverId);
      setActiveConversationId(conversationId);
    }

    if (conversationId) {
      try {
        await api.post('/chat/send', { conversationId, content });
      } catch (error) {
        toast.error('Erro ao enviar mensagem');
        console.error(error);
      }
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversationId,
      messages,
      setActiveConversationId,
      sendMessage,
      startConversation,
      loading,
      isChatOpen,
      setChatOpen,
      unreadCount
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};