import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { Problem, Solution, User } from '../types';

export interface Stats {
  activeMembers: number;
  activeDiscussions: number;
  acceptedSolutions: number;
}

export interface AppFilters {
  category: string;
  difficulty: string;
  problemId: string;
  searchQuery: string;
  status: string;
  hasReward: boolean;
}

export interface AppState {
  problems: Problem[];
  solutions: Solution[];
  users: User[];
  user: User | null;
  filters: AppFilters;
  filteredProblems: Problem[];
  filteredSolutions: Solution[];
  notifications: any[];
  stats: Stats;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_PROBLEMS'; payload: Problem[] }
  | { type: 'ADD_PROBLEM'; payload: Problem }
  | { type: 'SET_SOLUTIONS'; payload: Solution[] }
  | { type: 'ADD_SOLUTION'; payload: Solution }
  | { type: 'SET_FILTERS'; payload: Partial<AppFilters> }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_STATS'; payload: Partial<Stats> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: any };

export interface AppContextType extends AppState {
  dispatch: Dispatch<AppAction>;
  user: User | null;
  filters: AppFilters;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  problems: [],
  solutions: [],
  users: [],
  user: null,
  filters: {
    category: '',
    difficulty: '',
    problemId: '',
    searchQuery: '',
    status: '',
    hasReward: false
  },
  filteredProblems: [],
  filteredSolutions: [],
  notifications: [],
  stats: {
    activeMembers: 0,
    activeDiscussions: 0,
    acceptedSolutions: 0
  },
  loading: false,
  error: null
};

function appReducer(state: AppState, action: AppAction): AppState {
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
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const filteredProblems = state.problems.filter((problem: Problem) => {
    const matchesCategory = !state.filters.category || problem.category === state.filters.category;
    const matchesDifficulty = !state.filters.difficulty || problem.difficulty === state.filters.difficulty;
    const matchesSearch = !state.filters.searchQuery || 
      problem.title.toLowerCase().includes(state.filters.searchQuery.toLowerCase()) ||
      problem.description.toLowerCase().includes(state.filters.searchQuery.toLowerCase());

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const filteredSolutions = state.solutions.filter((solution: Solution) => {
    const matchesSearch = !state.filters.searchQuery || 
      solution.title.toLowerCase().includes(state.filters.searchQuery.toLowerCase());
    const matchesStatus = !state.filters.status || solution.status === state.filters.status;

    return matchesSearch && matchesStatus;
  });

  const value: AppContextType = {
    ...state,
    filteredProblems,
    filteredSolutions,
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