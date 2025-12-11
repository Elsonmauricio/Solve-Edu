-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'COMPANY', 'ADMIN', 'MENTOR');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('USER', 'VERIFIED', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ProblemCategory" AS ENUM ('TECHNOLOGY', 'SUSTAINABILITY', 'HEALTH', 'EDUCATION', 'BUSINESS', 'DESIGN', 'SCIENCE', 'ENGINEERING');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('MONEY', 'INTERNSHIP', 'PRIZE', 'CERTIFICATE', 'JOB_OFFER');

-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('DRAFT', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SolutionStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'NEEDS_REVISION', 'AWARDED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SOLUTION_SUBMITTED', 'SOLUTION_REVIEWED', 'PROBLEM_EXPIRING', 'NEW_MESSAGE', 'SYSTEM_UPDATE', 'AWARD_RECEIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "userType" "UserType" NOT NULL DEFAULT 'USER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "level" TEXT DEFAULT 'Iniciante',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "school" TEXT,
    "course" TEXT,
    "year" INTEGER,
    "skills" TEXT[],
    "portfolioUrl" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companySize" TEXT,
    "industry" TEXT,
    "website" TEXT,
    "description" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" "ProblemCategory" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "tags" TEXT[],
    "requirements" TEXT[],
    "reward" TEXT,
    "rewardType" "RewardType",
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "ProblemStatus" NOT NULL DEFAULT 'ACTIVE',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "SolutionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "technologies" TEXT[],
    "githubUrl" TEXT,
    "demoUrl" TEXT,
    "documentation" TEXT,
    "files" TEXT[],
    "rating" DOUBLE PRECISION,
    "feedback" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   