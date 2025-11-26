import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const useAuth = () => {
  const { user, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password, userType) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user data based on type
      const userData = userType === 'student' 
        ? {
            id: 1,
            name: "João Silva",
            email: email,
            role: "Estudante",
            school: "Universidade do Porto",
            level: "Avançado",
            isVerified: true,
            solutionsCount: 8,
            rating: 4.8
          }
        : {
            id: 2,
            name: "TechRetail Lda",
            email: email,
            role: "Empresa",
            company: "TechRetail Lda",
            level: "Parceiro",
            isVerified: true,
            problemsPosted: 12,
            solutionsAccepted: 8
          };

      dispatch({
        type: 'SET_USER',
        payload: userData
      });

      // Store in localStorage (in real app, this would be a token)
      localStorage.setItem('solveedu_user', JSON.stringify(userData));

      return userData;
    } catch (err) {
      setError('Credenciais inválidas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    dispatch({
      type: 'SET_USER',
      payload: null
    });
    localStorage.removeItem('solveedu_user');
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would create the user in the backend
      const newUser = {
        ...userData,
        id: Date.now(),
        isVerified: false,
        solutionsCount: 0,
        rating: 0
      };

      return newUser;
    } catch (err) {
      setError('Erro no registo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('solveedu_user');
    if (savedUser) {
      dispatch({
        type: 'SET_USER',
        payload: JSON.parse(savedUser)
      });
    }
  }, [dispatch]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };
};