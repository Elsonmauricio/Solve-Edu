import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useApp } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

interface StartChatButtonProps {
  targetUserId: string;
  className?: string;
  label?: string;
}

const StartChatButton: React.FC<StartChatButtonProps> = ({ 
  targetUserId, 
  className,
  label = "Enviar Mensagem"
}) => {
  const { startConversation, setActiveConversationId, setChatOpen } = useChat();
  const { user } = useApp();

  const handleStartChat = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir navegação se estiver dentro de um Link
    e.stopPropagation();

    if (!user) {
      toast.error('Precisa de fazer login para enviar mensagens.');
      return;
    }
    
    if (user.id === targetUserId) {
        toast.error('Não pode enviar mensagens para si mesmo.');
        return;
    }

    try {
      const conversationId = await startConversation(targetUserId);
      setActiveConversationId(conversationId);
      setChatOpen(true); // Força a abertura do widget de chat
      toast.success('Conversa iniciada!');
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      toast.error('Erro ao iniciar conversa.');
    }
  };

  return (
    <button 
      onClick={handleStartChat}
      className={className || "flex items-center gap-2 px-4 py-2 bg-solve-blue text-white rounded-lg hover:bg-solve-purple transition-colors font-medium"}
    >
      <MessageCircle size={18} />
      <span>{label}</span>
    </button>
  );
};

export default StartChatButton;
