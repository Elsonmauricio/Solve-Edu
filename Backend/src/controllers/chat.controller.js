// c:\Users\maels\Documents\Solve Edu\Backend\src\controllers\chat.controller.js

import { supabase } from '../lib/supabase.js';

export class ChatController {
  // Iniciar uma nova conversa ou obter uma existente
  static async startConversation(req, res) {
    try {
      const userId = req.userId?.trim();
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
      console.log(`[Chat] A registar participantes para a nova conversa ${newConv.id}`);
      const { error: partError } = await supabase
        .from('ConversationParticipant')
        .insert([
          { conversation_id: newConv.id, user_id: userId },
          { conversation_id: newConv.id, user_id: targetUserId }
        ])
        .select(); // Força o retorno para garantir que a escrita foi concluída

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
      const userId = req.userId?.trim();
      const { conversationId: rawConvId, content } = req.body;
      const conversationId = rawConvId?.trim();

      // Validação de Segurança
      if (!userId) {
        console.error('[Chat] Tentativa de envio sem userId no req');
        return res.status(401).json({ success: false, message: 'Utilizador não autenticado.' });
      }

      if (!conversationId || !content) {
        console.error('[Chat] Dados incompletos:', { conversationId, hasContent: !!content, body: req.body });
        return res.status(400).json({ success: false, message: 'Dados da mensagem incompletos.' });
      }

      // 0. Verificação de Segurança: O utilizador pertence a esta conversa?
      const isAdmin = req.userRole === 'ADMIN';
      
      const { data: participant } = await supabase
        .from('ConversationParticipant')
        .select('conversation_id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!participant && !isAdmin) {
        console.warn(`[Chat] Acesso negado. User ID: "${userId}", Convo ID: "${conversationId}", Role: ${req.userRole}`);
        // Log extra para verificar se o participante existe de facto
        const { data: check } = await supabase.from('ConversationParticipant')
          .select('conversation_id')
          .eq('conversation_id', conversationId)
          .limit(1);
        console.log(`[Chat Debug] Existem participantes nesta conversa? ${check?.length > 0 ? 'Sim' : 'Não'}`);

        return res.status(403).json({ success: false, message: 'Não tem permissão para enviar mensagens nesta conversa.' });
      }

      // 1. Inserir a mensagem
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

      // 2. Atualizar o timestamp da conversa (para subir no topo da lista)
      await supabase
        .from('Conversation')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // 3. Notificar via Broadcast (Ultra-rápido)
      // Isto permite que o frontend receba a mensagem sem depender apenas da replicação da BD
      await supabase.channel(`chat_room:${conversationId}`).send({
        type: 'broadcast',
        event: 'new-message',
        payload: message
      });

      // 4. Notificar o destinatário (Criar registo na tabela Notification)
      // Descobrir quem é o outro participante da conversa
      const { data: participants } = await supabase
        .from('ConversationParticipant')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', userId);

      if (participants && participants.length > 0) {
        const notifications = participants.map(p => ({
          userId: p.user_id, // Corrigido para camelCase para corresponder à tabela Notification
          type: 'NEW_MESSAGE',
          title: 'Nova Mensagem',
          message: `Nova mensagem de ${req.userName || 'alguém'}`,
          data: { conversationId, senderId: userId },
          isRead: false
        }));

        // Inserir notificação (sem bloquear erro, apenas log)
        const { error: notifError } = await supabase.from('Notification').insert(notifications);
        if (notifError) console.error('Erro ao criar notificação de chat:', notifError);
      }

      res.json({ success: true, data: message });

    } catch (error) {
      // Log detalhado para ajudar no debug
      console.error('Send message error:', error.message || error);
      res.status(500).json({ success: false, message: 'Erro ao enviar mensagem.' });
    }
  }

  // Obter conversas do utilizador
  static async getMyConversations(req, res) {
    try {
      const userId = req.userId;

      // 1. Buscar IDs das conversas onde sou participante
      const { data: myParticipations, error: partError } = await supabase
        .from('ConversationParticipant')
        .select('conversation_id')
        .eq('user_id', userId);

      if (partError) throw partError;

      const convIds = myParticipations.map(p => p.conversation_id);

      if (convIds.length === 0) {
        return res.json({ success: true, data: [] });
      }

      // 2. Buscar detalhes das conversas
      const { data: conversations, error: convError } = await supabase
        .from('Conversation')
        .select('*')
        .in('id', convIds)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      // 3. Buscar os outros participantes
      const { data: participants } = await supabase
        .from('ConversationParticipant')
        .select('conversation_id, User(id, name, avatar)')
        .in('conversation_id', convIds);

      // 4. Montar objeto final
      const enrichedConvs = conversations.map(conv => {
        const convParticipants = participants
          ?.filter(p => p.conversation_id === conv.id && p.User.id !== userId)
          .map(p => p.User) || [];
        
        return { ...conv, participants: convParticipants };
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
      const userId = req.userId;
      
      // Verificar se o utilizador pertence à conversa por segurança
      const { data: participant } = await supabase
        .from('ConversationParticipant')
        .select('conversation_id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .maybeSingle();

      const isAdmin = req.userRole === 'ADMIN';

      if (!participant && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Não tem permissão para aceder a esta conversa.' });
      }

      // 1. Obter as mensagens
      const { data, error } = await supabase
        .from('Message')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      // 2. Marcar mensagens do outro utilizador como lidas
      if (data && data.length > 0) {
        await supabase
          .from('Message')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', userId); // Apenas as mensagens que eu recebi
      }

      if (error) throw error;

      res.json({ success: true, data });

    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar mensagens.' });
    }
  }
}
