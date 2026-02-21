import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { problemsService } from '../services/problems.service';
import { Problem } from '../types';

export const useProblems = () => {
  const context = useApp();
  const problems = context.problems || [];
  const filteredProblems = context.filteredProblems || [];
  const dispatch = context.dispatch;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createProblem = useCallback(async (problemData: Partial<Problem>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await problemsService.create(problemData);
      
      dispatch({
        type: 'ADD_PROBLEM',
        payload: response.data || response
      });

      return response.data || response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar problema';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const fetchProblem = useCallback(async (id: string | number) => {
    setLoading(true);
    try {
      const response = await problemsService.getById(String(id));
      return response.data || response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar detalhes do desafio';
      console.error(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProblemById = useCallback((id: string | number) => {
    return problems.find((problem: Problem) => problem.id === parseInt(String(id)));
  }, [problems]);

  const getProblemsByCompany = useCallback((company: string) => {
    return problems.filter((problem: Problem) => problem.company?.companyName === company);
  }, [problems]);

  const getProblemsByCategory = useCallback((category: string) => {
    return problems.filter((problem: Problem) => problem.category === category);
  }, [problems]);

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