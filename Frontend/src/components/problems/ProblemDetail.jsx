import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  Clock, 
  Users, 
  Euro, 
  Building, 
  Target, 
  Calendar,
  ArrowLeft,
  Share2,
  Bookmark,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const ProblemDetail = () => {
  const { id } = useParams();
  const { problems } = useApp();
  
  const problem = problems.find(p => p.id === parseInt(id));

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Desafio não encontrado</h2>
          <p className="text-gray-600 mb-6">O desafio que procura não existe ou foi removido.</p>
          <Link to="/problems" className="bg-solve-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-solve-purple transition-colors">
            Voltar aos Desafios
          </Link>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante': return 'text-green-600 bg-green-100';
      case 'Intermediário': return 'text-yellow-600 bg-yellow-100';
      case 'Avançado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Tecnologia': 'text-blue-600 bg-blue-100',
      'Sustentabilidade': 'text-green-600 bg-green-100',
      'Saúde': 'text-red-600 bg-red-100',
      'Educação': 'text-purple-600 bg-purple-100',
      'Negócios': 'text-orange-600 bg-orange-100',
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          to="/problems"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar aos desafios</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-solve-blue to-solve-purple rounded-xl flex items-center justify-center">
                    <Target className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">
                      {problem.title}
                    </h1>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Building size={16} className="text-gray-400" />
                        <span className="text-gray-600 font-medium">{problem.company}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-500 text-sm">Publicado em {problem.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(problem.category)}`}>
                    {problem.category}
                  </span>
                  {problem.tags.map((tag) => (
                    <span key={tag} className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 bg-gray-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="p-3 border border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 transition-colors">
                  <Bookmark size={20} />
                </button>
                <button className="p-3 border border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Descrição do Desafio</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {problem.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Requisitos Técnicos</h3>
              <ul className="space-y-3">
                {problem.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-gray-700">Tipo de Solução Esperada:</strong>
                  <p className="text-gray-600 mt-1">Projeto completo com documentação e código fonte</p>
                </div>
                <div>
                  <strong className="text-gray-700">Direitos de Propriedade:</strong>
                  <p className="text-gray-600 mt-1">A empresa detém os direitos da solução após aprovação</p>
                </div>
                <div>
                  <strong className="text-gray-700">Suporte Disponível:</strong>
                  <p className="text-gray-600 mt-1">Mentoria técnica e esclarecimento de dúvidas</p>
                </div>
                <div>
                  <strong className="text-gray-700">Critérios de Avaliação:</strong>
                  <p className="text-gray-600 mt-1">Inovação, qualidade técnica e adequação aos requisitos</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Desafio</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Prazo</span>
                </div>
                <span className="font-semibold text-gray-900">{problem.deadline}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Soluções</span>
                </div>
                <span className="font-semibold text-gray-900">{problem.solutionsCount}</span>
              </div>

              {problem.reward && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Euro className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Recompensa</span>
                  </div>
                  <span className="font-semibold text-green-600">{problem.reward}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Dificuldade</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
            </div>
          </motion.div>

          {/* CTA Card */}
          <motion.div
            className="bg-gradient-to-r from-solve-blue to-solve-purple rounded-2xl p-6 text-white"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-2">Pronto para o desafio?</h3>
            <p className="text-blue-100 mb-6 text-sm">
              Desenvolva a sua solução e transforme-a na sua PAP
            </p>
            
            <Link
              to={`/submit-solution/${problem.id}`}
              className="block w-full bg-white text-solve-blue text-center py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors mb-3"
            >
              Submeter Solução
            </Link>
            
            <button className="block w-full bg-transparent border border-white text-white text-center py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Salvar para Depois
            </button>
          </motion.div>

          {/* Company Info */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre a Empresa</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                <Building className="text-gray-600" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{problem.company}</h4>
                <p className="text-sm text-gray-600">Parceira desde 2024</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Empresa inovadora no sector, comprometida com o desenvolvimento de talentos e soluções tecnológicas avançadas.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;