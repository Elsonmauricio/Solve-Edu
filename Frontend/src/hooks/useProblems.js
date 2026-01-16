import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { problemsService } from '../services/problems.service';

export const useProblems = () => {
  const { problems, filteredProblems, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProblem = async (problemData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call real API
      const response = await problemsService.create(problemData);
      
      dispatch({
        type: 'ADD_PROBLEM',
        // Assumindo que a API retorna o objeto criado em response.data
        payload: response.data || response
      });

      return response.data || response;
    } catch (err) {
      setError('Erro ao criar problema');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Busca um problema específico diretamente da API (dados frescos)
  const fetchProblem = async (id) => {
    setLoading(true);
    try {
      const response = await problemsService.getById(id);
      return response.data || response;
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar detalhes do desafio');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Busca do estado local (cache)
  const getProblemById = (id) => {
    return problems.find(problem => problem.id === parseInt(id));
  };

  const getProblemsByCompany = (company) => {
    return problems.filter(problem => problem.company === company);
  };

  const getProblemsByCategory = (category) => {
    return problems.filter(problem => problem.category === category);
  };

  return {
    problems: filteredProblems,
    allProblems: problems,
    loading,
    error,
    createProblem,
    fetchProblem,
    getProblemById,
    getProblemsByCompany,
    getProblemsByCategory
  };
};