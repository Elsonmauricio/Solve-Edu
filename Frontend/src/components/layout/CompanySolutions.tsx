import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Star, MessageSquare, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import { Solution } from '../../types';
import ReviewModal from './ReviewModal';
import MoonLoader from '../common/MoonLoader';

const CompanySolutions = () => {
  const { user } = useApp();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchSolutions = async () => {
    if (!user?.companyProfile?.id) return;
    
    try {
      setIsLoading(true);
      // Busca soluções filtradas pelo ID da empresa (implementado no backend)
      const response = await api.get('/solutions', {
        params: {
          companyId: user.companyProfile.id,
          status: filterStatus || undefined
        }
      });
      
      if (response.data.success) {
        setSolutions(response.data.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar soluções:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, [user, filterStatus]);

  const handleOpenReview = (solution: Solution) => {
    setSelectedSolution(solution);
    setIsReviewModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      NEEDS_REVISION: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      PENDING_REVIEW: 'Pendente',
      ACCEPTED: 'Aceite',
      REJECTED: 'Rejeitada',
      NEEDS_REVISION: 'Revisão'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Soluções Recebidas</h2>
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border-none bg-gray-50 rounded-lg focus:ring-0 cursor-pointer"
          >
            <option value="">Todos os estados</option>
            <option value="PENDING_REVIEW">Pendentes</option>
            <option value="ACCEPTED">Aceites</option>
            <option value="REJECTED">Rejeitadas</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8"><MoonLoader /></div>
      ) : solutions.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <p>Ainda não recebeu soluções para os seus desafios.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Solução / Desafio</th>
                <th className="px-6 py-4">Estudante</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Avaliação</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {solutions.map((solution) => (
                <tr key={solution.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{solution.title}</div>
                    <div className="text-xs text-gray-500">{(solution as any).problem?.title}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {(solution as any).student?.user?.name || 'Estudante'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(solution.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(solution.status)}</td>
                  <td className="px-6 py-4">
                    {solution.rating ? (
                      <div className="flex items-center text-yellow-400">
                        <span className="font-bold text-gray-700 mr-1">{solution.rating}</span>
                        <Star size={14} fill="currentColor" />
                      </div>
                    ) : <span className="text-gray-400 text-sm">-</span>}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link to={`/solutions/${solution.id}`} className="inline-block p-2 text-gray-400 hover:text-solve-blue transition-colors" title="Ver Detalhes">
                      <Eye size={18} />
                    </Link>
                    <button onClick={() => handleOpenReview(solution)} className="p-2 text-gray-400 hover:text-solve-purple transition-colors" title="Avaliar">
                      <MessageSquare size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSolution && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          solution={selectedSolution}
          onReviewComplete={fetchSolutions}
        />
      )}
    </div>
  );
};

export default CompanySolutions;