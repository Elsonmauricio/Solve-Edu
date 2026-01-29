// User Types
export interface StudentProfile {
  id: string;
  school?: string;
  course?: string;
  year?: number;
  skills?: string[];
}

export interface CompanyProfile {
  id: string;
  companyName?: string;
  industry?: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  role: 'Estudante' | 'Empresa' | 'Admin';
  school?: string;
  company?: string;
  level?: string;
  isVerified?: boolean;
  solutionsCount?: number;
  rating?: number;
  problemsPosted?: number;
  solutionsAccepted?: number;
  bio?: string;
  location?: string;
  joinedAt?: string;
  studentProfile?: StudentProfile;
  companyProfile?: CompanyProfile;
}

// Problem/Challenge Types
export interface Problem {
  id: string;
  title: string;
  description: string;
  company?: string | { id: string; companyName: string };
  category?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'Iniciante' | 'Intermediário' | 'Avançado' | string;
  reward?: number | string;
  status?: 'Aberto' | 'Fechado' | 'Em Análise';
  createdAt?: string;
  deadline?: string;
  technologies?: string[];
  tags?: string[];
  requirements?: string[];
  solutionsCount?: number;
}

// Solution Types
export interface Solution {
  id: string;
  problemId: string;
  title: string;
  description: string;
  student: string | {
    id: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    school?: string;
    year?: number;
  };
  school?: string;
  submittedAt?: string;
  status: 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'NEEDS_REVISION';
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  documentation?: string;
  feedback?: string;
  views?: number;
  rating?: number;
  votes?: number;
}

// Comment/Feedback Types
export interface Comment {
  id: string;
  solutionId: number;
  author: User;
  content: string;
  createdAt: string;
  likes?: number;
  replies?: Comment[];
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'solution_accepted' | 'new_feedback' | 'new_event' | 'new_message';
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Pagination type
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Stats Types
export interface Stats {
  activeMembers: number;
  activeDiscussions: number;
  acceptedSolutions: number;
  totalProblems?: number;
  totalCompanies?: number;
}

// App Context Types
export interface AppFilters {
  searchQuery: string;
  status: string;
  problemId: string;
  category?: string;
  difficulty?: string;
  company?: string;
  hasReward?: boolean;
}

export interface AppState {
  problems: Problem[];
  solutions: Solution[];
  users: User[];
  filteredProblems: Problem[];
  filteredSolutions: Solution[];
  filters: AppFilters;
  notifications: Notification[];
  stats: Stats;
  user: User | null;
  loading: boolean;
  error: string | null;
}
