import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const useProblems = () => {
  const { problems, filteredProblems, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProblem = async (problemData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProblem = {
        ...problemData,
        id: Date.now(),
        solutionsCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };

      dispatch({
        type: 'ADD_PROBLEM',
        payload: newProblem
      });

      return newProblem;
    } catch (err) {
      setError('Erro ao criar problema');
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
    getProblemById,
    getProblemsByCompany,
    getProblemsByCategory
  };
};