import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Star, 
  Eye, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  FileText,
  Code
} from 'lucide-react';

const SolutionList = ({ solutions, loading, error }) => {
  // Estado de Carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
  if (!solutions || solutions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma solução encontrada</h3>
          <p className="text-gray-500">Ainda não foram submetidas soluções. Sê o primeiro a resolver um desafio!</p>
        </div>
      </div>
    );
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return { text: 'Aceite', color: 'bg-green-100 text-green-700' };
      case 'REJECTED':
        return { text: 'Rejeitada', color: 'bg-red-100 text-red-700' };
      case 'PENDING_REVIEW':
        return { text: 'Em Análise', color: 'bg-yellow-100 text-yellow-700' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  // Lista de Soluções
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {solutions.map((solution, index) => {
          const statusInfo = getStatusInfo(solution.status);
          return (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={solution.student?.user?.avatar || `https://ui-avatars.com/api/?name=${solution.student?.user?.name}&background=random`} 
                      alt={solution.student?.user?.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {solution.student?.user?.name || "Estudante Anónimo"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Para: {solution.problem?.title || "Desafio"}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>

                <Link to={`/solutions/${solution.id}`}>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors line-clamp-2">
                    {solution.title}
                  </h2>
                </Link>
                
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {solution.description}
                </p>
              </div>

              <div className="p-6 mt-auto bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{solution.rating || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>{solution.views || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{new Date(solution.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Link 
                  to={`/solutions/${solution.id}`}
                  className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-purple-600 text-purple-600 py-2 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300"
                >
                  <span>Ver Detalhes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SolutionList;