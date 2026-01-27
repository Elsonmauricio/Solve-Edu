import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Users, Euro, Target, Building } from 'lucide-react';
import { Problem } from '../../types';

interface ProblemCardProps {
  problem: Problem;
  delay?: number;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem }) => {
  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
      case 'Iniciante': return 'text-green-600 bg-green-100';
      case 'Intermediário': return 'text-yellow-600 bg-yellow-100';
      case 'Avançado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string | undefined) => {
    const colors: Record<string, string> = {
      'Tecnologia': 'text-blue-600 bg-blue-100',
      'Sustentabilidade': 'text-green-600 bg-green-100',
      'Saúde': 'text-red-600 bg-red-100',
      'Educação': 'text-purple-600 bg-purple-100',
      'Negócios': 'text-orange-600 bg-orange-100',
    };
    return colors[category || 'default'] || 'text-gray-600 bg-gray-100';
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-solve-blue to-solve-purple rounded-lg flex items-center justify-center">
            <Target className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg line-clamp-2">
              {problem.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Building size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">{typeof problem.company === 'string' ? problem.company : problem.company?.companyName || "Confidencial"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {problem.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
          {problem.difficulty}
        </span>
        {problem.category && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(problem.category)}`}>
            {problem.category}
          </span>
        )}
        {problem.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
            {tag}
          </span>
        ))}
        {problem.tags && problem.tags.length > 2 && (
          <span className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 bg-gray-100">
            +{problem.tags.length - 2}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{problem.deadline}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={14} />
            <span>{problem.solutionsCount} soluções</span>
          </div>
        </div>
        {problem.reward && (
          <div className="flex items-center space-x-1 text-green-600 font-bold">
            <Euro size={14} />
            <span>{problem.reward}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Link
        to={`/problems/${problem.id}`}
        className="block w-full bg-gradient-to-r from-solve-blue to-solve-purple text-white text-center py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
      >
        Ver Detalhes
      </Link>
      </div>
    </motion.div>
  );
};

export default ProblemCard;
