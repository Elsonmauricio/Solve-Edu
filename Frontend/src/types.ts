/**
 * Ficheiro central de tipos para garantir consistência em toda a aplicação.
 */

// Tipos baseados nos modelos do Prisma e nos controllers do backend

export type Role = 'STUDENT' | 'COMPANY' | 'ADMIN' | 'MENTOR' | 'SCHOOL';

export type SolutionStatus = 'DRAFT' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'NEEDS_REVISION' | 'AWARDED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
  isVerified: boolean;
  isActive?: boolean;
  level?: string;
  createdAt: string;
  updatedAt:string;
  studentProfile?: StudentProfile;
  companyProfile?: CompanyProfile;
  schoolProfile?: SchoolProfile;
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

export interface SchoolProfile {
  id: string;
  userId: string;
  user?: User;
  schoolName?: string;
  address?: string;
  contactEmail?: string;
  phoneNumber?: string;
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
  status: SolutionStatus;
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