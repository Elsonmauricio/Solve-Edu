// c:\Users\maels\Documents\Solve Edu\Backend\src\controllers\chat.controller.js

import { supabase } from '../lib/supabase.js';

export class ChatController {
  // Iniciar uma nova conversa ou obter uma existente
  static async startConversation(req, res) {
    try {
      const userId = req.userId; // ID do utilizador logado (vindo do middleware)
      const { targetUserId } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ success: false, message: 'ID do destinatário obrigatório.' });
      }

      // 1. Verificar se já existe uma conversa entre estes dois utilizadores
      // (Esta lógica é simplificada; para produção idealmente usaria uma query SQL mais robusta)
      const { data: myConvs } = await supabase
        .from('ConversationParticipant')
        .select('conversation_id')
        .eq('user_id', userId);

      const myConvIds = myConvs.map(c => c.conversation_id);

      if (myConvIds.length > 0) {
        const { data: existing } = await supabase
          .from('ConversationParticipant')
          .select('conversation_id')
          .eq('user_id', targetUserId)
          .in('conversation_id', myConvIds)
          .maybeSingle();

        if (existing) {
          return res.json({ success: true, conversationId: existing.conversation_id });
        }
      }

      // 2. Se não existe, criar nova conversa
      const { data: newConv, error: createError } = await supabase
        .from('Conversation')
        .insert({})
        .select()
        .single();

      if (createError) throw createError;

      // 3. Adicionar participantes
      const { error: partError } = await supabase
        .from('ConversationParticipant')
        .insert([
          { conversation_id: newConv.id, user_id: userId },
          { conversation_id: newConv.id, user_id: targetUserId }
        ]);

      if (partError) throw partError;

      res.json({ success: true, conversationId: newConv.id });

    } catch (error) {
      console.error('Start conversation error:', error);
      res.status(500).json({ success: false, message: 'Erro ao iniciar conversa.' });
    }
  }

  // Enviar uma mensagem
  static async sendMessage(req, res) {
    try {
      const userId = req.userId;
      const { conversationId, content } = req.body;

      const { data: message, error } = await supabase
        .from('Message')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: content
        })
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, data: message });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ success: false, message: 'Erro ao enviar mensagem.' });
    }
  }

  // Obter conversas do utilizador
  static async getMyConversations(req, res) {
    try {
      const userId = req.userId;

      // Buscar IDs das conversas
      const { data: participantRows, error } = await supabase
        .from('ConversationParticipant')
        .select('conversation_id, Conversation(*)')
        .eq('user_id', userId);

      if (error) throw error;

      const rawConvs = participantRows.map(row => row.Conversation);
      const convIds = rawConvs.map(c => c.id);

      if (convIds.length === 0) {
        return res.json({ success: true, data: [] });
      }

      // Buscar os outros participantes para mostrar nomes/fotos
      const { data: others } = await supabase
        .from('ConversationParticipant')
        .select('conversation_id, User(id, name, avatar)')
        .in('conversation_id', convIds)
        .neq('user_id', userId);

      const enrichedConvs = rawConvs.map(conv => {
        const participants = others
          ?.filter(o => o.conversation_id === conv.id)
          .map(o => o.User) || [];
        return { ...conv, participants };
      });

      res.json({ success: true, data: enrichedConvs });

    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar conversas.' });
    }
  }

  // Obter mensagens de uma conversa
  static async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      
      // TODO: Verificar se o utilizador pertence à conversa por segurança

      const { data, error } = await supabase
        .from('Message')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      res.json({ success: true, data });

    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar mensagens.' });
    }
  }
}
