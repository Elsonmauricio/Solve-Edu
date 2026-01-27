import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Github, ExternalLink, Star, Eye, MessageCircle, User, Calendar } from 'lucide-react';
import { Solution } from '../../types';

interface SolutionCardProps {
  solution: Solution;
  delay?: number;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aceite': return 'text-green-600 bg-green-100';
      case 'Em Análise': return 'text-yellow-600 bg-yellow-100';
      case 'Rejeitada': return 'text-red-600 bg-red-100';
      case 'Revisão Solicitada': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTechColor = (tech: string) => {
    const colors: Record<string, string> = {
      'Python': 'text-blue-600 bg-blue-100',
      'JavaScript': 'text-yellow-600 bg-yellow-100',
      'React': 'text-cyan-600 bg-cyan-100',
      'Node.js': 'text-green-600 bg-green-100',
      'TensorFlow': 'text-orange-600 bg-orange-100',
      'MongoDB': 'text-green-600 bg-green-100',
      'PostgreSQL': 'text-blue-600 bg-blue-100',
      'Django': 'text-green-600 bg-green-100',
    };
    return colors[tech] || 'text-gray-600 bg-gray-100';
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
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-solve-teal to-solve-blue rounded-lg flex items-center justify-center">
              <Star className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg line-clamp-2">
                {solution.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <User size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">{typeof solution.student === 'string' ? solution.student : solution.student.user.name}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{solution.school || (typeof solution.student !== 'string' ? solution.student.school : '')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {solution.description}
      </p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-4">
        {solution.technologies.slice(0, 4).map((tech) => (
          <span key={tech} className={`px-3 py-1 rounded-full text-xs font-medium ${getTechColor(tech)}`}>
            {tech}
          </span>
        ))}
        {solution.technologies.length > 4 && (
          <span className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 bg-gray-100">
            +{solution.technologies.length - 4}
          </span>
        )}
      </div>

      {/* Stats and Status */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{solution.submittedAt}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye size={14} />
            <span>{solution.views || 0} visualizações</span>
          </div>
          {solution.githubUrl && (
            <a
              href={solution.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>
          )}
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(solution.status)}`}>
          {solution.status}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Link
          to={`/solutions/${solution.id}`}
          className="flex-1 bg-gradient-to-r from-solve-teal to-solve-blue text-white text-center py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <ExternalLink size={16} />
          <span>Ver Solução</span>
        </Link>
        <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:border-solve-blue hover:text-solve-blue transition-all duration-200 flex items-center justify-center">
          <MessageCircle size={16} />
        </button>
      </div>
      </div>
    </motion.div>
  );
};

export default SolutionCard;
