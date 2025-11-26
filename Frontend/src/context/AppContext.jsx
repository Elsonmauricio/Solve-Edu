import React, { createContext, useContext, useReducer } from 'react';
import { mockProblems, mockSolutions } from '../data/mockData';

const AppContext = createContext();

const initialState = {
  problems: mockProblems,
  solutions: mockSolutions,
  user: null,
  filters: {
    category: '',
    difficulty: '',
    hasReward: false,
    searchQuery: ''
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_PROBLEMS':
      return { ...state, problems: action.payload };
    case 'ADD_PROBLEM':
      return { ...state, problems: [...state.problems, action.payload] };
    case 'SET_SOLUTIONS':
      return { ...state, solutions: action.payload };
    case 'ADD_SOLUTION':
      return { ...state, solutions: [...state.solutions, action.payload] };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const filteredProblems = state.problems.filter(problem => {
    const matchesCategory = !state.filters.category || problem.category === state.filters.category;
    const matchesDifficulty = !state.filters.difficulty || problem.difficulty === state.filters.difficulty;
    const matchesReward = !state.filters.hasReward || problem.reward;
    const matchesSearch = !state.filters.searchQuery || 
      problem.title.toLowerCase().includes(state.filters.searchQuery.toLowerCase()) ||
      problem.description.toLowerCase().includes(state.filters.searchQuery.toLowerCase());

    return matchesCategory && matchesDifficulty && matchesReward && matchesSearch;
  });

  const value = {
    ...state,
    filteredProblems,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};