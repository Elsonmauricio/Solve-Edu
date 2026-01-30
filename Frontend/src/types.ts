/**
 * Ficheiro central de tipos para garantir consistência em toda a aplicação.
 */

// Tipos baseados nos modelos do Prisma e nos controllers do backend

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'STUDENT' | 'COMPANY' | 'ADMIN' | 'MENTOR';
  isVerified: boolean;
  isActive?: boolean;
  level?: string;
  createdAt: string;
  updatedAt:string;
  studentProfile?: StudentProfile;
  companyProfile?: CompanyProfile;
  // Propriedades adicionadas no frontend
  solutionsCount?: number;
  rating?: number;
  companyName?: string;
  problemsPosted?: number;
  solutionsAccepted?: number;
}

export interface StudentProfile {
  id: string;
  userId: string;
  user?: User;
  school?: string;
  year?: number;
  solutions?: Solution[];
}

export interface CompanyProfile {
  id: string;
  userId: string;
  user?: User;
  companyName?: string;
  industry?: string;
  problems?: Problem[];
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  status: 'DRAFT' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'ARCHIVED';
  tags: string[];
  requirements: string[];
  deadline: string;
  reward?: string;
  views?: number;
  isFeatured?: boolean;
  companyId: string;
  company?: CompanyProfile;
  solutions?: Solution[];
  _count?: {
    solutions: number;
  };
  createdAt: string;
}

export interface Solution {
  id: number;
  title: string;
  description: string;
  githubUrl?: string;
  demoUrl?: string;
  documentation?: string;
  technologies: string[];
  status: 'DRAFT' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'NEEDS_REVISION' | 'AWARDED';
  feedback?: string;
  rating?: number;
  likes?: number;
  submittedAt: string;
  reviewedAt?: string;
  problemId: number;
  problem?: Problem;
  studentId: string;
  student: StudentProfile; // A propriedade student é um objeto de perfil
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppFilters {
  searchQuery: string;
  category: string;
  difficulty: string;
  hasReward: boolean;
}