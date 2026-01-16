import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { solutionsService } from '../services/solutions.service';

export const useSolutions = () => {
  const { solutions, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSolution = async (solutionData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call real API - Nota: create requer problemId como primeiro argumento
      const response = await solutionsService.create(solutionData.problemId, solutionData);
      
      dispatch({
        type: 'ADD_SOLUTION',
        payload: response.data || response
      });

      return response.data || response;
    } catch (err) {
      setError('Erro ao submeter solução');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Busca uma solução específica diretamente da API
  const fetchSolution = async (id) => {
    setLoading(true);
    try {
      const response = await solutionsService.getById(id);
      return response.data || response;
    } catch (err) {
      setError('Erro ao carregar solução');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSolutionById = (id) => {
    return solutions.find(solution => solution.id === parseInt(id));
  };

  const getSolutionsByProblem = (problemId) => {
    return solutions.filter(solution => solution.problemId === parseInt(problemId));
  };

  const getSolutionsByStudent = (student) => {
    return solutions.filter(solution => solution.student === student);
  };

  const updateSolutionStatus = async (solutionId, status, feedback = null) => {
    setLoading(true);
    try {
      // Chama a API real para atualizar/avaliar a solução
      const response = await solutionsService.review(solutionId, { status, feedback });
      const updatedSolution = response.data || response;

      // Atualiza o estado local com a resposta da API
      const updatedSolutions = solutions.map(solution => 
        solution.id === solutionId ? updatedSolution : solution
      );

      dispatch({
        type: 'SET_SOLUTIONS',
        payload: updatedSolutions
      });
      
      return updatedSolution;
    } catch (err) {
      setError('Erro ao atualizar status da solução');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    solutions,
    loading,
    error,
    createSolution,
    fetchSolution,
    getSolutionById,
    getSolutionsByProblem,
    getSolutionsByStudent,
    updateSolutionStatus
  };
};