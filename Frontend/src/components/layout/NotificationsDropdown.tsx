import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, MessageSquare, Award } from 'lucide-react';

interface Notification {
  id: string; 
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    solutionId?: string;
    problemId?: string;
    conversationId?: string;
  };
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'SOLUTION_REVIEWED':
      return <Award className="w-5 h-5 text-purple-500" />;
    case 'SOLUTION_SUBMITTED':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'NEW_COMMENT':
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case 'NEW_MESSAGE':
      return <MessageSquare className="w-5 h-5 text-solve-blue" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getLinkForNotification = (notification: Notification) => {
  if (notification.data?.solutionId) {
    return `/solutions/${notification.data.solutionId}`;
  }
  if (notification.data?.problemId) {
    return `/problems/${notification.data.problemId}`;
  }
  if (notification.type === 'NEW_MESSAGE') {
    return '#'; // O clique será gerido pelo handler
  }
  return '#';
};

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ notifications, isOpen, onClose, onNotificationClick }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          {...({ className:"absolute top-14 right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 overflow-hidden"} as any)}
        >
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Notificações</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <Link 
                  to={getLinkForNotification(notif)} 
                  key={notif.id} 
                  onClick={(e) => {
                    if (onNotificationClick) onNotificationClick(notif);
                    if (notif.type === 'NEW_MESSAGE') e.preventDefault(); // Impede navegação se for chat
                    else onClose();
                  }}
                >
                  <div className={`p-4 flex items-start space-x-3 hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50' : ''}`}>
                    <div className="flex-shrink-0 mt-1">
                      {getIconForType(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                      <p className="text-xs text-gray-600">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                    {!notif.isRead && <div className="w-2 h-2 bg-solve-blue rounded-full mt-2"></div>}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell size={24} className="mx-auto mb-2" />
                <p>Não tem notificações.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsDropdown;