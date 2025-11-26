import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import SolutionCard from '../ui/SolutionCard';
import { Filter, Search, X } from 'lucide-react';

const SolutionList = () => {
  const { solutions, problems } = useApp();
  const [filters, setFilters] = React.useState({
    searchQuery: '',
    status: '',
    problemId: ''
  });

  const statusOptions = ['Em Análise', 'Aceite', 'Rejeitada', 'Revisão Solicitada'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      status: '',
      problemId: ''
    });
  };

  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = !filters.searchQuery || 
      solution.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      solution.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      solution.student.toLowerCase().includes(filters.searchQuery.toLowerCase());

    const matchesStatus = !filters.status || solution.status === filters.status;
    const matchesProblem = !filters.problemId || solution.problemId === parseInt(filters.problemId);

    return matchesSearch && matchesStatus && matchesProblem;
  });

  const hasActiveFilters = filters.searchQuery || filters.status || filters.problemId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
          Soluções Submetidas
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Explore soluções inovadoras desenvolvidas pela comunidade estudantil para desafios reais
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
              placeholder="Pesquisar soluções..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
          >
            <option value="">Todos os status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Problem Filter */}
          <select
            value={filters.problemId}
            onChange={(e) => handleFilterChange('problemId', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
          >
            <option value="">Todos os problemas</option>
            {problems.map(problem => (
              <option key={problem.id} value={problem.id}>{problem.title}</option>
            ))}
          </select>

          {/* Sort Options */}
          <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent">
            <option value="newest">Mais Recentes</option>
            <option value="popular">Mais Populares</option>
            <option value="rating">Melhor Avaliadas</option>
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {filteredSolutions.length} soluç{filteredSolutions.length !== 1 ? 'ões' : 'ão'} encontrada{filteredSolutions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Solutions Grid */}
      <AnimatePresence mode="wait">
        {filteredSolutions.length > 0 ? (
          <motion.div
            key="solutions-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredSolutions.map((solution, index) => (
              <SolutionCard
                key={solution.id}
                solution={solution}
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
              Nenhuma solução encontrada
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {hasActiveFilters 
                ? "Tente ajustar os seus filtros de pesquisa para ver mais soluções."
                : "Ainda não há soluções submetidas. Seja o primeiro a partilhar a sua solução!"
              }
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

export default SolutionList;