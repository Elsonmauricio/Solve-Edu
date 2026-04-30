import React from 'react';
import { useApp } from '../../context/AppContext';
import { AppFilters } from '../../types';

const ProblemFilters = () => {
  const { filters, dispatch } = useApp();

  const categories = ['', 'Tecnologia', 'Sustentabilidade', 'Saúde', 'Educação', 'Negócios'];
  const difficulties = ['', 'Iniciante', 'Intermediário', 'Avançado'];

  const handleFilterChange = (filterType: keyof AppFilters, value: string | boolean) => {
    dispatch({ type: 'SET_FILTERS', payload: { [filterType]: value } });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoria
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category || 'Todas as Categorias'}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dificuldade
        </label>
        <select
          value={filters.difficulty}
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent"
        >
          {difficulties.map(difficulty => (
            <option key={difficulty} value={difficulty}>
              {difficulty || 'Todas as Dificuldades'}
            </option>
          ))}
        </select>
      </div>

      {/* Reward Filter */}
      <div className="flex items-end">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.hasReward}
            onChange={(e) => handleFilterChange('hasReward', e.target.checked)}
            className="w-4 h-4 text-solve-blue focus:ring-solve-blue border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Apenas com Recompensa</span>
        </label>
      </div>

      {/* Clear Filters */}
      <div className="flex items-end">
        <button
          onClick={() => dispatch({ type: 'SET_FILTERS', payload: { category: '', difficulty: '', hasReward: false, searchQuery: '' } })}
          className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
};

export default ProblemFilters;