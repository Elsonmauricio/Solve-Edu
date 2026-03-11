import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckSquare, Square, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Solution } from '../../types';
import MoonLoader from '../common/MoonLoader';
import { toast } from 'react-hot-toast';

const SchoolSolutionsList = () => {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSolutions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/school/solutions');
      if (response.data.success) {
        setSolutions(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar soluções da escola:', error);
      toast.error('Não foi possível carregar as soluções.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  const handleTogglePAP = async (solutionId: string) => {
    // Atualização otimista da UI
    setSolutions(prev => 
      prev.map(s => s.id === solutionId ? { ...s, isPAP: !s.isPAP } : s)
    );

    try {
      // O endpoint togglePAP já foi criado no SolutionController
      const response = await api.post(`/solutions/${solutionId}/toggle-pap`);
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar estado PAP.');
      // Reverte a UI em caso de erro
      fetchSolutions();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const handleExportGrades = async () => {
    try {
      // Usar a nossa instância do axios (api) para que envie cookies/headers
      const response = await api.get('/solutions/export/grades', {
        responseType: 'blob' // Importante para lidar com ficheiros
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pauta_avaliacoes.xlsx');
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar pauta:', error);
      toast.error('Erro ao descarregar a pauta.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      {...({ className:"bg-white rounded-2xl shadow-lg border border-gray-200" } as any)}
    >
      <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Validação e Avaliação Oficial de Provas (PAP)</h2>
        <button 
          onClick={handleExportGrades}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
        >
          <Download size={16} />
          <span>Exportar Pauta</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-8"><MoonLoader /></div>
      ) : solutions.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <p>Nenhuma solução submetida por alunos da sua escola ainda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Solução</th>
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Validado como PAP</th>
                <th className="px-6 py-4 text-center">Nota</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {solutions.map((solution) => (
                <tr key={solution.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{solution.title}</div>
                    <div className="text-xs text-gray-500">{solution.problem?.title}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {solution.student?.user?.name || 'Aluno'}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(solution.status)}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleTogglePAP(solution.id)}
                      className="flex items-center justify-center w-full space-x-2 text-gray-600 hover:text-solve-blue"
                    >
                      {solution.isPAP ? <CheckSquare className="text-green-500" /> : <Square />}
                      <span className="text-sm">{solution.isPAP ? 'Sim' : 'Não'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-gray-700">
                      {solution.schoolGrade || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/solutions/${solution.id}`} className="inline-block p-2 text-gray-400 hover:text-solve-blue transition-colors" title="Ver Detalhes">
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default SchoolSolutionsList;