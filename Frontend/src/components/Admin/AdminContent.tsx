// c:\Users\maels\Documents\Solve Edu\Frontend\src\pages\admin\AdminContent.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { solutionsService } from '../../services/solution.service';
import { Solution } from '../../types';
import { CheckCircle, XCircle, ExternalLink, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminContent = () => {
  const [pendingSolutions, setPendingSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    try {
      setIsLoading(true);
      // Busca soluções com status PENDING_REVIEW
      const response = await solutionsService.getAll({ status: 'PENDING_REVIEW' });
      if (response.success) {
        setPendingSolutions(response.data.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar conteúdo pendente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (id: number, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await solutionsService.review(id, { status });
      setPendingSolutions(prev => prev.filter(s => s.id !== id));
      toast.success(`Solução ${status === 'ACCEPTED' ? 'aprovada' : 'rejeitada'} com sucesso`);
    } catch (error) {
      toast.error('Erro ao processar revisão');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Moderação de Conteúdo</h1>

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">A carregar...</div>
          ) : pendingSolutions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Tudo Limpo!</h3>
              <p className="text-gray-500 mt-2">Não há conteúdo pendente de revisão neste momento.</p>
            </div>
          ) : (
            pendingSolutions.map((solution) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                {...({ className: "bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between gap-6"} as any)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pendente
                    </span>
                    <span className="text-sm text-gray-500">
                      Submetido a {new Date(solution.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{solution.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{solution.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {solution.technologies.map(tech => (
                      <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-4 text-sm">
                    {solution.demoUrl && (
                      <a href={solution.demoUrl} target="_blank" rel="noreferrer" className="flex items-center text-solve-blue hover:underline">
                        <ExternalLink className="w-4 h-4 mr-1" /> Ver Demo
                      </a>
                    )}
                    {solution.githubUrl && (
                      <a href={solution.githubUrl} target="_blank" rel="noreferrer" className="flex items-center text-gray-700 hover:underline">
                        <ExternalLink className="w-4 h-4 mr-1" /> Ver Código
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col justify-center gap-3 min-w-[150px]">
                  <button
                    onClick={() => handleReview(solution.id, 'ACCEPTED')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                  >
                    <CheckCircle className="w-4 h-4" /> Aprovar
                  </button>
                  <button
                    onClick={() => handleReview(solution.id, 'REJECTED')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                  >
                    <XCircle className="w-4 h-4" /> Rejeitar
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
