import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const useSolutions = () => {
  const { solutions, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSolution = async (solutionData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSolution = {
        ...solutionData,
        id: Date.now(),
        status: 'Em Análise',
        submittedAt: new Date().toISOString().split('T')[0],
        views: 0
      };

      dispatch({
        type: 'ADD_SOLUTION',
        payload: newSolution
      });

      return newSolution;
    } catch (err) {
      setError('Erro ao submeter solução');
      throw err;
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

  const updateSolutionStatus = (solutionId, status) => {
    const updatedSolutions = solutions.map(solution => 
      solution.id === solutionId 
        ? { ...solution, status }
        : solution
    );

    dispatch({
      type: 'SET_SOLUTIONS',
      payload: updatedSolutions
    });
  };

  return {
    solutions,
    loading,
    error,
    createSolution,
    getSolutionById,
    getSolutionsByProblem,
    getSolutionsByStudent,
    updateSolutionStatus
  };
};