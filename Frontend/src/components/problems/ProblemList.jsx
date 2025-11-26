import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import ProblemCard from '../ui/ProblemCard';
import { Filter, Search, X } from 'lucide-react';

const ProblemList = () => {
  const { filteredProblems, filters, dispatch } = useApp();

  const categories = ['Tecnologia', 'Sustentabilidade', 'Saúde', 'Educação', 'Negócios'];
  const difficulties = ['Iniciante', 'Intermediário', 'Avançado'];

  const handleFilterChange = (key, value) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: { [key]: value }
    });
  };

  const clearFilters = () => {
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        category: '',
        difficulty: '',
        hasReward: false,
        searchQuery: ''
      }
    });
  };

  const hasActiveFilters = filters.category || filters.difficulty || filters.hasReward || filters.searchQuery;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
          Desafios Disponíveis
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Encontre problemas reais de empresas que precisam da sua solução inovadora
        </p>
      </div>

      {/* Filters */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <X size={16} />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar desafios..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
          >
            <option value="">Todas as dificuldades</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>

          {/* Reward Filter */}
          <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasReward}
              onChange={(e) => handleFilterChange('hasReward', e.target.checked)}
              className="w-4 h-4 text-solve-blue focus:ring-solve-blue border-gray-300 rounded"
            />
            <span className="text-gray-700">Apenas com recompensa</span>
          </label>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {filteredProblems.length} desafio{filteredProblems.length !== 1 ? 's' : ''} encontrado{filteredProblems.length !== 1 ? 's' : ''}
        </p>
        
        {/* Sort Options */}
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent">
          <option value="newest">Mais Recentes</option>
          <option value="deadline">Prazo Mais Curto</option>
          <option value="reward">Maior Recompensa</option>
          <option value="popular">Mais Populares</option>
        </select>
      </div>

      {/* Problems Grid */}
      <AnimatePresence mode="wait">
        {filteredProblems.length > 0 ? (
          <motion.div
            key="problems-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredProblems.map((problem, index) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                delay={index * 0.1}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-results"
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum desafio encontrado
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Tente ajustar os seus filtros de pesquisa ou limpar todos os filtros para ver mais desafios.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 bg-solve-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-solve-purple transition-colors"
              >
                Limpar Filtros
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProblemList;