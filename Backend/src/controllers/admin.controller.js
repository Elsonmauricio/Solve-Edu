import { validationResult } from 'express-validator';
import prisma from '../config/database.js';

export class AdminController {
  static async getDashboardStats(req, res) {
    try {
      const [
        totalUsers,
        totalStudents,
        totalCompanies,
        totalProblems,
        activeProblems,
        totalSolutions,
        pendingSolutions,
        newUsersToday,
        newProblemsToday,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'COMPANY' } }),
        prisma.problem.count(),
        prisma.problem.count({ where: { status: 'ACTIVE' } }),
        prisma.solution.count(),
        prisma.solution.count({ where: { status: 'PENDING_REVIEW' } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        prisma.problem.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
      ]);

      const stats = {
        users: {
          total: totalUsers,
          students: totalStudents,
          companies: totalCompanies,
          newToday: newUsersToday,
        },
        problems: {
          total: totalProblems,
          active: activeProblems,
          newToday: newProblemsToday,
        },
        solutions: {
          total: totalSolutions,
          pending: pendingSolutions,
        },
        platform: {
          acceptanceRate: totalSolutions > 0 
            ? (await prisma.solution.count({ where: { status: 'ACCEPTED' } })) / totalSolutions * 100 
            : 0,
          avgSolutionRating: await prisma.solution.aggregate({
            _avg: { rating: true },
            where: { rating: { not: null } }
          }),
        }
      };

      res.json({
        success: true,
        data: stats,
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar estatísticas do dashboard.' 
      });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, role, search, isActive, isVerified } = req.query;
      const skip = (page - 1) * limit;

      const where = {
        AND: [
          role ? { role } : {},
          isActive !== undefined ? { isActive: isActive === 'true' } : {},
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
            updatedAt: true,
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

  static async getUserDetails(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          studentProfile: {
            include: {
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
          },
          companyProfile: {
            include: {
              problems: {
                include: {
                  _count: {
                    select: { solutions: true }
                  },
                  solutions: {
                    where: { status: 'ACCEPTED' },
                    take: 5,
                  }
                }
              }
            }
          },
          notifications: {
            orderBy: { createdAt: 'desc' },
            take: 10,
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
      console.error('Get user details error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar detalhes do utilizador.' 
      });
    }
  }

  static async verifyUser(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.update({
        where: { id },
        data: { isVerified: true },
        select: {
          id: true,
          email: true,
          name: true,
          isVerified: true,
          updatedAt: true,
        }
      });

      res.json({
        success: true,
        message: 'Utilizador verificado com sucesso!',
        data: user,
      });

    } catch (error) {
      console.error('Verify user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao verificar utilizador.' 
      });
    }
  }

  static async toggleUserBlock(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: { isActive: true }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilizador não encontrado.' 
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          updatedAt: true,
        }
      });

      const action = updatedUser.isActive ? 'desbloqueada' : 'bloqueada';

      res.json({
        success: true,
        message: `Conta ${action} com sucesso!`,
        data: updatedUser,
      });

    } catch (error) {
      console.error('Toggle user block error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao bloquear/desbloquear utilizador.' 
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

  static async getPendingProblems(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const [problems, total] = await Promise.all([
        prisma.problem.findMany({
          where: { status: 'DRAFT' },
          include: {
            company: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    isVerified: true,
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.problem.count({ where: { status: 'DRAFT' } }),
      ]);

      res.json({
        success: true,
        data: {
          problems,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        }
      });

    } catch (error) {
      console.error('Get pending problems error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar problemas pendentes.' 
      });
    }
  }

  static async approveProblem(req, res) {
    try {
      const { id } = req.params;

      const problem = await prisma.problem.update({
        where: { id },
        data: { 
          status: 'ACTIVE',
          isFeatured: req.body.isFeatured || false,
        },
        include: {
          company: {
            include: {
              user: true
            }
          }
        }
      });

      // Create notification for company
      await prisma.notification.create({
        data: {
          userId: problem.company.user.id,
          type: 'SYSTEM_UPDATE',
          title: 'Desafio Aprovado',
          message: `O seu desafio "${problem.title}" foi aprovado e está agora ativo na plataforma.`,
          data: {
            problemId: problem.id,
            isFeatured: problem.isFeatured,
          },
        },
      });

      res.json({
        success: true,
        message: 'Desafio aprovado com sucesso!',
        data: problem,
      });

    } catch (error) {
      console.error('Approve problem error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao aprovar desafio.' 
      });
    }
  }

  static async rejectProblem(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const problem = await prisma.problem.update({
        where: { id },
        data: { status: 'ARCHIVED' },
        include: {
          company: {
            include: {
              user: true
            }
          }
        }
      });

      // Create notification for company
      await prisma.notification.create({
        data: {
          userId: problem.company.user.id,
          type: 'SYSTEM_UPDATE',
          title: 'Desafio Rejeitado',
          message: `O seu desafio "${problem.title}" foi rejeitado. Razão: ${reason || 'Não especificada'}`,
          data: {
            problemId: problem.id,
            reason,
          },
        },
      });

      res.json({
        success: true,
        message: 'Desafio rejeitado com sucesso!',
        data: problem,
      });

    } catch (error) {
      console.error('Reject problem error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao rejeitar desafio.' 
      });
    }
  }

  static async toggleProblemFeature(req, res) {
    try {
      const { id } = req.params;

      const problem = await prisma.problem.findUnique({
        where: { id }
      });

      if (!problem) {
        return res.status(404).json({ 
          success: false, 
          message: 'Desafio não encontrado.' 
        });
      }

      const updatedProblem = await prisma.problem.update({
        where: { id },
        data: { isFeatured: !problem.isFeatured },
        include: {
          company: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        }
      });

      const action = updatedProblem.isFeatured ? 'destacado' : 'removido dos destaques';

      res.json({
        success: true,
        message: `Desafio ${action} com sucesso!`,
        data: updatedProblem,
      });

    } catch (error) {
      console.error('Toggle problem feature error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao destacar desafio.' 
      });
    }
  }

  static async getPendingSolutions(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const [solutions, total] = await Promise.all([
        prisma.solution.findMany({
          where: { status: 'PENDING_REVIEW' },
          include: {
            problem: {
              include: {
                company: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      }
                    }
                  }
                }
              }
            },
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    isVerified: true,
                  }
                }
              }
            }
          },
          orderBy: { submittedAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.solution.count({ where: { status: 'PENDING_REVIEW' } }),
      ]);

      res.json({
        success: true,
        data: {
          solutions,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        }
      });

    } catch (error) {
      console.error('Get pending solutions error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar soluções pendentes.' 
      });
    }
  }

  static async reviewSolution(req, res) {
    try {
      const { id } = req.params;
      const { status, rating, feedback } = req.body;

      if (!['ACCEPTED', 'REJECTED', 'NEEDS_REVISION'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Status inválido.' 
        });
      }

      const solution = await prisma.solution.update({
        where: { id },
        data: { 
          status,
          rating: rating ? parseFloat(rating) : null,
          feedback: feedback || null,
          reviewedAt: new Date(),
        },
        include: {
          problem: {
            include: {
              company: {
                include: {
                  user: true
                }
              }
            }
          },
          student: {
            include: {
              user: true
            }
          }
        }
      });

      // Create notifications
      await Promise.all([
        // Notification for student
        prisma.notification.create({
          data: {
            userId: solution.student.user.id,
            type: 'SOLUTION_REVIEWED',
            title: 'Solução Avaliada',
            message: `A sua solução para "${solution.problem.title}" foi ${status.toLowerCase()}.`,
            data: {
              solutionId: solution.id,
              status,
              rating: solution.rating,
              problemTitle: solution.problem.title,
            },
          },
        }),
        // Notification for company
        prisma.notification.create({
          data: {
            userId: solution.problem.company.user.id,
            type: 'SOLUTION_REVIEWED',
            title: 'Solução Avaliada',
            message: `Uma solução para o seu desafio "${solution.problem.title}" foi ${status.toLowerCase()}.`,
            data: {
              solutionId: solution.id,
              status,
              studentName: solution.student.user.name,
            },
          },
        }),
      ]);

      res.json({
        success: true,
        message: 'Solução avaliada com sucesso!',
        data: solution,
      });

    } catch (error) {
      console.error('Review solution error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao avaliar solução.' 
      });
    }
  }

  static async getSystemStats(req, res) {
    try {
      const [
        // User statistics
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        userGrowthRate,
        
        // Problem statistics
        totalProblems,
        activeProblems,
        featuredProblems,
        problemViews,
        
        // Solution statistics
        totalSolutions,
        acceptedSolutions,
        averageRating,
        solutionLikes,
        
        // Platform statistics
        averageResponseTime,
        mostActiveCategory,
        topPerformingStudent,
        topPublishingCompany,
      ] = await Promise.all([
        // User stats
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        prisma.$queryRaw`
          SELECT 
            COUNT(*) as count,
            DATE_TRUNC('month', "createdAt") as month
          FROM "User"
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month DESC
          LIMIT 12
        `,
        
        // Problem stats
        prisma.problem.count(),
        prisma.problem.count({ where: { status: 'ACTIVE' } }),
        prisma.problem.count({ where: { isFeatured: true } }),
        prisma.problem.aggregate({ _sum: { views: true } }),
        
        // Solution stats
        prisma.solution.count(),
        prisma.solution.count({ where: { status: 'ACCEPTED' } }),
        prisma.solution.aggregate({ _avg: { rating: true } }),
        prisma.solution.aggregate({ _sum: { likes: true } }),
        
        // Platform stats (simplified calculations)
        prisma.$queryRaw`
          SELECT AVG(EXTRACT(EPOCH FROM ("reviewedAt" - "submittedAt"))/86400) as avg_days
          FROM "Solution"
          WHERE "reviewedAt" IS NOT NULL
        `,
        prisma.$queryRaw`
          SELECT "category", COUNT(*) as count
          FROM "Problem"
          GROUP BY "category"
          ORDER BY count DESC
          LIMIT 1
        `,
        prisma.$queryRaw`
          SELECT u."name", COUNT(s.id) as solutions_count, AVG(s.rating) as avg_rating
          FROM "Solution" s
          JOIN "StudentProfile" sp ON s."studentId" = sp.id
          JOIN "User" u ON sp."userId" = u.id
          WHERE s.status = 'ACCEPTED'
          GROUP BY u.id, u."name"
          ORDER BY solutions_count DESC
          LIMIT 1
        `,
        prisma.$queryRaw`
          SELECT u."name", COUNT(p.id) as problems_count
          FROM "Problem" p
          JOIN "CompanyProfile" cp ON p."companyId" = cp.id
          JOIN "User" u ON cp."userId" = u.id
          GROUP BY u.id, u."name"
          ORDER BY problems_count DESC
          LIMIT 1
        `,
      ]);

      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          growth: userGrowthRate,
        },
        problems: {
          total: totalProblems,
          active: activeProblems,
          featured: featuredProblems,
          totalViews: problemViews._sum.views || 0,
          mostActiveCategory: mostActiveCategory[0]?.category || 'N/A',
        },
        solutions: {
          total: totalSolutions,
          accepted: acceptedSolutions,
          acceptanceRate: totalSolutions > 0 ? (acceptedSolutions / totalSolutions) * 100 : 0,
          averageRating: averageRating._avg.rating ? parseFloat(averageRating._avg.rating.toFixed(2)) : 0,
          totalLikes: solutionLikes._sum.likes || 0,
        },
        platform: {
          averageResponseTime: averageResponseTime[0]?.avg_days 
            ? parseFloat(averageResponseTime[0].avg_days.toFixed(1)) + ' dias'
            : 'N/A',
          topPerformingStudent: {
            name: topPerformingStudent[0]?.name || 'N/A',
            solutions: topPerformingStudent[0]?.solutions_count || 0,
            rating: topPerformingStudent[0]?.avg_rating 
              ? parseFloat(topPerformingStudent[0].avg_rating.toFixed(2))
              : 0,
          },
          topPublishingCompany: {
            name: topPublishingCompany[0]?.name || 'N/A',
            problems: topPublishingCompany[0]?.problems_count || 0,
          },
        },
      };

      res.json({
        success: true,
        data: stats,
      });

    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar estatísticas do sistema.' 
      });
    }
  }

  static async getLogs(req, res) {
    try {
      const { type, page = 1, limit = 50 } = req.query;
      const skip = (page - 1) * limit;

      // In a real application, you would query from a proper logging system
      // This is a simplified version
      const logs = [
        {
          id: 1,
          type: 'USER_REGISTER',
          message: 'New user registered: João Silva',
          timestamp: new Date().toISOString(),
          data: { userId: '123', email: 'joao@example.com' },
        },
        {
          id: 2,
          type: 'SOLUTION_SUBMITTED',
          message: 'Solution submitted for problem: Sistema de Inventário',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          data: { solutionId: '456', problemId: '789' },
        },
      ];

      res.json({
        success: true,
        data: {
          logs,
          page: parseInt(page),
          limit: parseInt(limit),
          total: logs.length,
          totalPages: 1,
        }
      });

    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar logs.' 
      });
    }
  }

  static async createAnnouncement(req, res) {
    try {
      const { title, message, type, targetUsers } = req.body;

      // In a real application, you would:
      // 1. Store the announcement in the database
      // 2. Send notifications to target users
      // 3. Possibly send emails

      const announcement = {
        id: Date.now(),
        title,
        message,
        type,
        targetUsers,
        createdAt: new Date().toISOString(),
        createdBy: req.userId,
      };

      // Create notifications for all users or specific targets
      if (targetUsers === 'ALL') {
        // This would be batched in production
        const users = await prisma.user.findMany({
          select: { id: true },
        });

        // Create notifications (simplified - would be batched in production)
        for (const user of users) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'SYSTEM_UPDATE',
              title: `Anúncio: ${title}`,
              message,
              data: {
                announcementId: announcement.id,
                type,
              },
            },
          });
        }
      }

      res.json({
        success: true,
        message: 'Anúncio criado e enviado com sucesso!',
        data: announcement,
      });

    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar anúncio.' 
      });
    }
  }
}