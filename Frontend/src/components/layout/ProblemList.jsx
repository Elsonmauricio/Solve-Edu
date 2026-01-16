import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  Tag, 
  Building, 
  ArrowRight, 
  Clock,
  Briefcase
} from 'lucide-react';

const ProblemList = ({ problems, loading, error }) => {
  // Estado de Carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Estado de Erro
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 text-lg font-medium mb-2">Ops! Algo correu mal.</p>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // Estado Vazio
  if (!problems || problems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum desafio encontrado</h3>
          <p className="text-gray-500">Tente ajustar os filtros ou volte mais tarde para ver novos desafios.</p>
        </div>
      </div>
    );
  }

  // Lista de Desafios
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {problems.map((problem, index) => (
          <motion.div
            key={problem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
          >
            {/* Header do Card */}
            <div className="p-6 border-b border-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {problem.company?.companyName || problem.company?.name || "Empresa Confidencial"}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {problem.category || "Geral"}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  problem.difficulty === 'ADVANCED' ? 'bg-red-100 text-red-700' :
                  problem.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {problem.difficulty === 'ADVANCED' ? 'Avançado' : 
                   problem.difficulty === 'INTERMEDIATE' ? 'Intermédio' : 'Iniciante'}
                </span>
              </div>

              <Link to={`/problems/${problem.id}`}>
                <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                  {problem.title}
                </h2>
              </Link>
              
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {problem.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {problem.tags && problem.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer do Card */}
            <div className="p-6 mt-auto bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-700 font-medium">
                  <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                  {problem.reward}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(problem.deadline).toLocaleDateString()}
                </div>
              </div>
              
              <Link 
                to={`/problems/${problem.id}`}
                className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-blue-600 text-blue-600 py-2 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                <span>Ver Detalhes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProblemList;