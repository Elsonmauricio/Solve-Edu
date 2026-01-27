import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Trophy, Zap } from 'lucide-react';
import { User } from '../../types';

interface UserBadgeProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStats?: boolean;
}

const UserBadge: React.FC<UserBadgeProps> = ({ user, size = 'md', showStats = false }) => {
  const sizeClasses: Record<string, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg'
  };

  const getLevelColor = (level: string | undefined) => {
    switch (level) {
      case 'Iniciante': return 'from-green-400 to-green-600';
      case 'Intermediário': return 'from-blue-400 to-blue-600';
      case 'Avançado': return 'from-purple-400 to-purple-600';
      case 'Expert': return 'from-yellow-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRoleColor = (role: string | undefined) => {
    switch (role) {
      case 'Estudante': return 'bg-blue-100 text-blue-800';
      case 'Empresa': return 'bg-green-100 text-green-800';
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Mentor': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200">
      {/* Avatar */}
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-gradient-to-r ${getLevelColor(user.level)} rounded-full flex items-center justify-center text-white font-bold`}>
          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        {user.isVerified && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {user.name}
          </h3>
          {user.role === 'Estudante' && (user.solutionsCount ?? 0) > 10 && (
            <Zap className="w-4 h-4 text-yellow-500" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
            {user.role}
          </span>
          <span className="text-xs text-gray-500">{user.school || user.company}</span>
        </div>

        {/* Stats */}
        {showStats && user.role === 'Estudante' && (
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Trophy className="w-3 h-3" />
              <span>{user.solutionsCount} soluções</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>{user.rating}/5</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="w-3 h-3 text-purple-500" />
              <span>Nv. {user.level}</span>
            </div>
          </div>
        )}

        {showStats && user.role === 'Empresa' && (
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Award className="w-3 h-3" />
              <span>{user.problemsPosted} problemas</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>{user.solutionsAccepted} soluções aceites</span>
            </div>
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );
};

export default UserBadge;
