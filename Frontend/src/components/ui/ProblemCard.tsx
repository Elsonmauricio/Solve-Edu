import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { Problem } from '../../types';

interface ProblemCardProps {
  problem: Problem;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-solve-blue transition-colors group h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-solve-blue transition-colors">
            {problem.title}
          </h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {problem.description}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          problem.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
          problem.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {problem.status === 'ACTIVE' ? 'Ativo' : 
           problem.status === 'EXPIRED' ? 'Expirado' : 'Inativo'}
        </span>
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <Link 
          to={`/problems/${problem.id}`}
          className="text-solve-blue hover:text-solve-purple text-sm font-medium flex items-center"
        >
          Ver <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default ProblemCard;