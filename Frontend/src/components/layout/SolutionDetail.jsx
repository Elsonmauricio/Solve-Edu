import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Calendar, Star, Github, ExternalLink, 
  MessageSquare, CheckCircle, XCircle, Clock,
  ArrowLeft, Download, Eye, ThumbsUp, ArrowRight
} from 'lucide-react';
import { solutionsService } from '../../services/solutions.service';

const SolutionDetail = () => {
  const { id } = useParams();
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        setLoading(true);
        const response = await solutionsService.getById(id);
        if (response.success) {
          setSolution(response.data);
        } else {
          setError(response.message || 'Erro ao carregar a solução.');
        }
      } catch (err) {
        setError('Erro de conexão ao carregar a solução.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !solution) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600">{error || 'Solução não encontrada.'}</p>
          <Link to="/solutions" className="text-red-700 font-medium hover:underline mt-4 inline-block">
            Voltar para Soluções
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle className="w-5 h-5 mr-2" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 mr-2" />;
      default: return <Clock className="w-5 h-5 mr-2" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/solutions" 
          className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Soluções
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div 
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mb-4 ${getStatusColor(solution.status)}`}>
                    {getStatusIcon(solution.status)}
                    {solution.status === 'ACCEPTED' ? 'Aceite' : 
                     solution.status === 'REJECTED' ? 'Rejeitada' : 'Em Análise'}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{solution.title}</h1>
                  <p className="text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Submetido em {new Date(solution.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-center text-yellow-500 font-bold text-xl">
                      <Star className="w-5 h-5 mr-1 fill-current" />
                      {solution.rating || '-'}
                    </div>
                    <span className="text-xs text-gray-500">Avaliação</span>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none text-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição da Solução</h3>
                <p className="whitespace-pre-line">{solution.description}</p>
              </div>

              {solution.technologies && solution.technologies.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                    Tecnologias Utilizadas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {solution.technologies.map((tech) => (
                      <span 
                        key={tech} 
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Section (if exists) */}
            {(solution.feedback || solution.status !== 'PENDING_REVIEW') && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                  Feedback da Empresa
                </h3>
                {solution.feedback ? (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <p className="text-gray-700 italic">"{solution.feedback}"</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Ainda sem feedback escrito.</p>
                )}
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Student Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Desenvolvido por
              </h3>
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src={solution.student?.user?.avatar || `https://ui-avatars.com/api/?name=${solution.student?.user?.name}&background=random`}
                  alt={solution.student?.user?.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-bold text-gray-900">{solution.student?.user?.name}</div>
                  <div className="text-sm text-gray-500">{solution.student?.school}</div>
                </div>
              </div>
            </div>

            {/* Links Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Links do Projeto
              </h3>
              <div className="space-y-3">
                {solution.githubUrl && (
                  <a 
                    href={solution.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    <span className="flex items-center">
                      <Github className="w-5 h-5 mr-2" />
                      Repositório
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {solution.demoUrl && (
                  <a 
                    href={solution.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    <span className="flex items-center">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Live Demo
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
                {!solution.githubUrl && !solution.demoUrl && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Nenhum link público disponível.
                  </p>
                )}
              </div>
            </div>

            {/* Problem Context Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-2">
                Em resposta ao desafio
              </h3>
              <Link to={`/problems/${solution.problem?.id}`} className="group">
                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {solution.problem?.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {solution.problem?.description}
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  Ver Desafio Original
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SolutionDetail;