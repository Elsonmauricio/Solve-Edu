import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User as UserIcon, Minimize2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = () => {
  const { user } = useApp();
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    messages, 
    sendMessage,
    isChatOpen,
    setChatOpen,
    unreadCount
  } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático para o fundo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null; // Não mostrar se não estiver logado

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            {...({className: "bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col mb-4 overflow-hidden"} as any)}
          >
            {/* Header */}
            <div className="bg-solve-blue p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare size={18} />
                {activeConversationId ? 'Conversa' : 'Mensagens'}
              </h3>
              <div className="flex gap-2">
                {activeConversationId && (
                  <button onClick={() => setActiveConversationId(null)} className="hover:bg-white/20 p-1 rounded">
                    <Minimize2 size={16} />
                  </button>
                )}
                <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 p-1 rounded">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {!activeConversationId ? (
                // Lista de Conversas
                <div className="p-2">
                  {conversations.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10 p-4">
                      <p>Ainda não tem conversas.</p>
                      <p className="text-xs mt-2">Visite o perfil de uma empresa ou aluno para iniciar um chat.</p>
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const otherParticipant = conv.participants?.[0];
                      const displayName = otherParticipant?.name || `Conversa #${conv.id.slice(0, 4)}`;
                      const displayAvatar = otherParticipant?.avatar;

                      return (
                        <div 
                          key={conv.id}
                          onClick={() => setActiveConversationId(conv.id)}
                          className="p-3 bg-white rounded-xl mb-2 cursor-pointer hover:shadow-md transition-all border border-gray-100 flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-solve-blue overflow-hidden">
                            {displayAvatar ? (
                              <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{displayName}</p>
                            <p className="text-xs text-gray-500">Clique para abrir</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                // Área de Mensagens
                <div className="p-4 flex flex-col gap-3">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                          isMe 
                            ? 'bg-solve-blue text-white rounded-tr-none' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area (Só mostra se houver conversa ativa) */}
            {activeConversationId && (
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-solve-blue outline-none"
                />
                <button type="submit" className="bg-solve-blue text-white p-2 rounded-xl hover:bg-solve-purple transition-colors">
                  <Send size={18} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        onClick={() => setChatOpen(!isChatOpen)}
        className="bg-gradient-to-r from-solve-blue to-solve-purple text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative"
      >
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isChatOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;