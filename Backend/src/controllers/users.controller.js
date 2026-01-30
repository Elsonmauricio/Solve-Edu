import { validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';

export class UserController {
  static async getUserProfile(req, res) {
    try {
      const userId = req.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { studentProfile: true, companyProfile: true }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilizador não encontrado.' 
        });
      }

      // Get additional stats based on role
      let stats = {};
      if (user.role === 'STUDENT') {
        const solutions = await prisma.solution.count({
          where: { student: { userId } }
        });
        const acceptedSolutions = await prisma.solution.count({
          where: { 
            student: { userId },
            status: 'ACCEPTED'
          }
        });
        
        stats = { solutions, acceptedSolutions };
      } else if (user.role === 'COMPANY') {
        const problems = await prisma.problem.count({
          where: { company: { userId } }
        });
        const activeProblems = await prisma.problem.count({
          where: { 
            company: { userId },
            status: 'ACTIVE'
          }
        });
        
        stats = { problems, activeProblems };
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            isVerified: user.isVerified,
            level: user.level,
            createdAt: user.createdAt,
          },
          profile: user.studentProfile || user.companyProfile,
          stats,
        }
      });

    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar perfil.' 
      });
    }
  }

  static async updateUserProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.userId;
      const updateData = req.body;

      // Remove sensitive fields
      delete updateData.password;
      delete updateData.email;
      delete updateData.role;
      delete updateData.id;

      const profileData = updateData.profile;
      delete updateData.profile;

      const prismaUpdateData = { ...updateData };

      if (profileData) {
        if (req.userRole === 'STUDENT') {
          prismaUpdateData.studentProfile = { update: profileData };
        } else if (req.userRole === 'COMPANY') {
          prismaUpdateData.companyProfile = { update: profileData };
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: prismaUpdateData,
        include: { studentProfile: true, companyProfile: true }
      });

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        data: { user }
      });

    } catch (error) {
      console.error('Update user profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar perfil.' 
      });
    }
  }

  static async getUserStats(req, res) {
    try {
      const userId = req.userId;
      const userRole = req.userRole;

      let stats = {};

      if (userRole === 'STUDENT') {
        const [
          totalSolutions,
          acceptedSolutions,
          pendingSolutions,
          averageRating,
          totalLikes,
          problemsSolved,
        ] = await Promise.all([
          prisma.solution.count({
            where: { student: { userId } }
          }),
          prisma.solution.count({
            where: { 
              student: { userId },
              status: 'ACCEPTED'
            }
          }),
          prisma.solution.count({
            where: { 
              student: { userId },
              status: 'PENDING_REVIEW'
            }
          }),
          prisma.solution.aggregate({
            _avg: { rating: true },
            where: { 
              student: { userId },
              rating: { not: null }
            }
          }),
          prisma.solution.aggregate({
            _sum: { likes: true },
            where: { student: { userId } }
          }),
          prisma.problem.count({
            where: {
              solutions: {
                some: {
                  student: { userId },
                  status: 'ACCEPTED'
                }
              }
            }
          }),
        ]);

        stats = {
          totalSolutions,
          acceptedSolutions,
          pendingSolutions,
          acceptanceRate: totalSolutions > 0 ? (acceptedSolutions / totalSolutions) * 100 : 0,
          averageRating: averageRating._avg.rating || 0,
          totalLikes: totalLikes._sum.likes || 0,
          problemsSolved,
        };

      } else if (userRole === 'COMPANY') {
        const [
          totalProblems,
          activeProblems,
          expiredProblems,
          totalSolutions,
          acceptedSolutions,
          averageSolutionRating,
        ] = await Promise.all([
          prisma.problem.count({
            where: { company: { userId } }
          }),
          prisma.problem.count({
            where: { 
              company: { userId },
              status: 'ACTIVE'
            }
          }),
          prisma.problem.count({
            where: { 
              company: { userId },
              status: 'EXPIRED'
            }
          }),
          prisma.solution.count({
            where: {
              problem: { company: { userId } }
            }
          }),
          prisma.solution.count({
            where: {
              problem: { company: { userId } },
              status: 'ACCEPTED'
            }
          }),
          prisma.solution.aggregate({
            _avg: { rating: true },
            where: {
              problem: { company: { userId } },
              rating: { not: null }
            }
          }),
        ]);

        stats = {
          totalProblems,
          activeProblems,
          expiredProblems,
          totalSolutions,
          acceptedSolutions,
          acceptanceRate: totalSolutions > 0 ? (acceptedSolutions / totalSolutions) * 100 : 0,
          averageSolutionRating: averageSolutionRating._avg.rating || 0,
        };
      }

      res.json({
        success: true,
        data: stats,
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar estatísticas.' 
      });
    }
  }

  static async getTopStudents(req, res) {
    try {
      const topStudents = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          isActive: true,
        },
        include: {
          studentProfile: {
            include: {
              solutions: {
                where: { status: 'ACCEPTED' },
                select: { rating: true }
              }
            }
          }
        },
        take: 10,
      });

      const formattedStudents = topStudents.map(student => {
        const solutions = student.studentProfile?.solutions || [];
        const averageRating = solutions.length > 0 
          ? solutions.reduce((sum, s) => sum + (s.rating || 0), 0) / solutions.length
          : 0;

        return {
          id: student.id,
          name: student.name,
          avatar: student.avatar,
          level: student.level,
          school: student.studentProfile?.school,
          solutionsCount: solutions.length,
          averageRating: parseFloat(averageRating.toFixed(1)),
          skills: student.studentProfile?.skills || [],
        };
      }).sort((a, b) => b.solutionsCount - a.solutionsCount);

      res.json({
        success: true,
        data: formattedStudents,
      });

    } catch (error) {
      console.error('Get top students error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar top estudantes.' 
      });
    }
  }

  static async getTopCompanies(req, res) {
    try {
      const topCompanies = await prisma.user.findMany({
        where: {
          role: 'COMPANY',
          isActive: true,
        },
        include: {
          companyProfile: {
            include: {
              problems: {
                include: {
                  solutions: {
                    where: { status: 'ACCEPTED' }
                  }
                }
              }
            }
          }
        },
        take: 10,
      });

      const formattedCompanies = topCompanies.map(company => {
        const problems = company.companyProfile?.problems || [];
        const totalSolutions = problems.reduce((sum, p) => sum + p.solutions.length, 0);
        const acceptedSolutions = problems.reduce(
          (sum, p) => sum + p.solutions.filter(s => s.status === 'ACCEPTED').length, 
          0
        );

        return {
          id: company.id,
          name: company.name,
          avatar: company.avatar,
          companyName: company.companyProfile?.companyName,
          industry: company.companyProfile?.industry,
          problemsPosted: problems.length,
          solutionsAccepted: acceptedSolutions,
          acceptanceRate: totalSolutions > 0 ? (acceptedSolutions / totalSolutions) * 100 : 0,
        };
      }).sort((a, b) => b.problemsPosted - a.problemsPosted);

      res.json({
        success: true,
        data: formattedCompanies,
      });

    } catch (error) {
      console.error('Get top companies error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar top empresas.' 
      });
    }
  }

  // Admin functions
  static async getAllUsers(req, res) {
    try {
      const { role, isVerified, search, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const where = {
        AND: [
          role ? { role } : {},
          isVerified !== undefined ? { isVerified: isVerified === 'true' } : {},
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          } : {},
        ]
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatar: true,
            isVerified: true,
            isActive: true,
            level: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          users,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar utilizadores.' 
      });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          studentProfile: true,
          companyProfile: true,
          problems: {
            include: {
              _count: {
                select: { solutions: true }
              }
            }
          },
          solutions: {
            include: {
              problem: {
                select: {
                  title: true,
                  company: {
                    include: {
                      user: {
                        select: {
                          name: true,
                          avatar: true,
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilizador não encontrado.' 
        });
      }

      res.json({
        success: true,
        data: user,
      });

    } catch (error) {
      console.error('Get user by id error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar utilizador.' 
      });
    }
  }

  static async updateUserById(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Prevent updating sensitive fields without proper permissions
      if (req.userId !== id) {
        delete updateData.email;
        delete updateData.password;
        delete updateData.role;
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData
      });

      res.json({
        success: true,
        message: 'Utilizador atualizado com sucesso!',
        data: user,
      });

    } catch (error) {
      console.error('Update user by id error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar utilizador.' 
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent deleting self
      if (req.userId === id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Não pode eliminar a sua própria conta.' 
        });
      }

      await prisma.user.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Utilizador eliminado com sucesso!',
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao eliminar utilizador.' 
      });
    }
  }
}