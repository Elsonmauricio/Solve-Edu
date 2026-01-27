import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { solutionsService } from '../services/solutions.service';
import { Solution } from '../types';

export const useSolutions = () => {
  const context = useApp();
  const solutions = context.solutions || [];
  const dispatch = context.dispatch;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createSolution = useCallback(async (solutionData: Partial<Solution>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await solutionsService.create(
        solutionData.problemId || 0, 
        solutionData
      );
      
      dispatch({
        type: 'ADD_SOLUTION',
        payload: response.data || response
      });

      return response.data || response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao submeter solução';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const fetchSolution = useCallback(async (id: string | number) => {
    setLoading(true);
    try {
      const response = await solutionsService.getById(id);
      return response.data || response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar solução';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSolutionById = useCallback((id: string | number) => {
    return solutions.find((solution: Solution) => solution.id === parseInt(String(id)));
  }, [solutions]);

  const getSolutionsByProblem = useCallback((problemId: string | number) => {
    return solutions.filter((solution: Solution) => solution.problemId === parseInt(String(problemId)));
  }, [solutions]);

  const getSolutionsByStudent = useCallback((student: string) => {
    return solutions.filter((solution: Solution) => solution.student === student);
  }, [solutions]);

  const updateSolutionStatus = useCallback(async (
    solutionId: number,
    status: string,
    feedback: string | null = null
  ) => {
    setLoading(true);
    try {
      const response = await solutionsService.review(solutionId, { status, feedback });
      const updatedSolution = response.data || response;

      const updatedSolutions = solutions.map((solution: Solution) => 
        solution.id === solutionId ? updatedSolution : solution
      );

      dispatch({
        type: 'SET_SOLUTIONS',
        payload: updatedSolutions
      });
      
      return updatedSolution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status da solução';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [solutions, dispatch]);

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