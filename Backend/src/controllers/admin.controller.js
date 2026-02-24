import { validationResult } from 'express-validator';
import { supabase } from '../lib/supabase.js';
import disk from 'diskusage';
import os from 'os';

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
        supabase.from('User').select('*', { count: 'exact', head: true }).then(r => r.count || 0),
        supabase.from('User').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT').then(r => r.count || 0),
        supabase.from('User').select('*', { count: 'exact', head: true }).eq('role', 'COMPANY').then(r => r.count || 0),
        supabase.from('Problem').select('*', { count: 'exact', head: true }).then(r => r.count || 0),
        supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE').then(r => r.count || 0),
        supabase.from('Solution').select('*', { count: 'exact', head: true }).then(r => r.count || 0),
        supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('status', 'PENDING_REVIEW').then(r => r.count || 0),
        supabase.from('User').select('*', { count: 'exact', head: true }).gte('createdAt', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()).then(r => r.count || 0),
        supabase.from('Problem').select('*', { count: 'exact', head: true }).gte('createdAt', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()).then(r => r.count || 0),
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
      };

      // Cálculos adicionais (Acceptance Rate e Avg Rating)
      const { count: acceptedCount } = await supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('status', 'ACCEPTED').then(res => ({ count: res.count || 0 }));
      
      // Para média, buscamos os ratings (Supabase JS não tem aggregate direto simples sem RPC)
      const { data: ratings } = await supabase.from('Solution').select('rating').not('rating', 'is', null);
      const avgRating = ratings?.length 
        ? ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratings.length 
        : 0;

      stats.platform = {
          acceptanceRate: totalSolutions > 0 ? (acceptedCount / totalSolutions * 100) : 0,
          avgSolutionRating: { _avg: { rating: avgRating } } // Mantendo estrutura para compatibilidade frontend
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

      let query = supabase
        .from('User')
        .select('id, email, name, role, avatar, isVerified, isActive, level, createdAt, updatedAt', { count: 'exact' });

      if (role) query = query.eq('role', role);
      if (isActive !== undefined) query = query.eq('isActive', isActive === 'true');
      if (isVerified !== undefined) query = query.eq('isVerified', isVerified === 'true');
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      query = query
        .order('createdAt', { ascending: false })
        .range(skip, skip + parseInt(limit) - 1);

      const { data: users, count: total, error } = await query;

      if (error) throw error;

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

      // Nota: Supabase não suporta includes profundos complexos e filtragem aninhada (como 'take: 5' em sub-relação) numa só query facilmente.
      // Vamos buscar os dados principais e depois carregar os detalhes se necessário, ou simplificar a query.
      // Aqui usamos a sintaxe de resource embedding do PostgREST.
      
      const { data: user, error } = await supabase
        .from('User')
        .select(`*, 
          studentProfile:StudentProfile(*, solutions:Solution(*, problem:Problem(title, company:CompanyProfile(user:User(name, avatar))))),
          companyProfile:CompanyProfile(*, problems:Problem(*, solutions:Solution(*))),
          notifications:Notification(*)
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 é "row not found" no single()

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilizador não encontrado.' 
        });
      }

      // Ordenar notificações manualmente já que o embedding não suporta order by facilmente em todos os níveis
      if (user.notifications) {
        user.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        user.notifications = user.notifications.slice(0, 10);
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

      const { data: user, error } = await supabase
        .from('User')
        .update({ isVerified: true })
        .eq('id', id)
        .select('id, email, name, isVerified, updatedAt')
        .single();

      if (error) throw error;

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

      const { data: user } = await supabase
        .from('User')
        .select('isActive')
        .eq('id', id)
        .single();

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilizador não encontrado.' 
        });
      }

      const { data: updatedUser, error } = await supabase
        .from('User')
        .update({ isActive: !user.isActive })
        .eq('id', id)
        .select('id, email, name, isActive, updatedAt')
        .single();

      if (error) throw error;

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

      await supabase.from('User').delete().eq('id', id);

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

      const { data: problems, count: total, error } = await supabase
        .from('Problem')
        .select('*, company:CompanyProfile(*, user:User(id, name, email, isVerified))', { count: 'exact' })
        .eq('status', 'DRAFT')
        .order('createdAt', { ascending: false })
        .range(skip, skip + parseInt(limit) - 1);

      if (error) throw error;

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

      const { data: problem, error } = await supabase
        .from('Problem')
        .update({ 
          status: 'ACTIVE',
          isFeatured: req.body.isFeatured || false,
        })
        .eq('id', id)
        .select('*, company:CompanyProfile(*, user:User(*))')
        .single();

      if (error) throw error;

      // Helper para obter ID do utilizador da empresa
      const companyUserId = Array.isArray(problem.company.user) ? problem.company.user[0].id : problem.company.user.id;

      // Create notification for company
      await supabase.from('Notification').insert({
          userId: companyUserId,
          type: 'SYSTEM_UPDATE',
          title: 'Desafio Aprovado',
          message: `O seu desafio "${problem.title}" foi aprovado e está agora ativo na plataforma.`,
          data: {
            problemId: problem.id,
            isFeatured: problem.isFeatured,
          }
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

      const { data: problem, error } = await supabase
        .from('Problem')
        .update({ status: 'ARCHIVED' })
        .eq('id', id)
        .select('*, company:CompanyProfile(*, user:User(*))')
        .single();

      if (error) throw error;

      const companyUserId = Array.isArray(problem.company.user) ? problem.company.user[0].id : problem.company.user.id;

      // Create notification for company
      await supabase.from('Notification').insert({
          userId: companyUserId,
          type: 'SYSTEM_UPDATE',
          title: 'Desafio Rejeitado',
          message: `O seu desafio "${problem.title}" foi rejeitado. Razão: ${reason || 'Não especificada'}`,
          data: {
            problemId: problem.id,
            reason,
          }
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

      const { data: problem } = await supabase
        .from('Problem')
        .select('isFeatured')
        .eq('id', id)
        .single();

      if (!problem) {
        return res.status(404).json({ 
          success: false, 
          message: 'Desafio não encontrado.' 
        });
      }

      const { data: updatedProblem, error } = await supabase
        .from('Problem')
        .update({ isFeatured: !problem.isFeatured })
        .eq('id', id)
        .select('*, company:CompanyProfile(*, user:User(id, name))')
        .single();

      if (error) throw error;

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

      const { data: solutions, count: total, error } = await supabase
        .from('Solution')
        .select('*, problem:Problem(*, company:CompanyProfile(*, user:User(id, name, email))), student:StudentProfile(*, user:User(id, name, email, isVerified))', { count: 'exact' })
        .eq('status', 'PENDING_REVIEW')
        .order('submittedAt', { ascending: false })
        .range(skip, skip + parseInt(limit) - 1);

      if (error) throw error;

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

      const { data: solution, error } = await supabase
        .from('Solution')
        .update({ 
          status,
          rating: rating ? parseFloat(rating) : null,
          feedback: feedback || null,
          reviewedAt: new Date(),
        })
        .eq('id', id)
        .select('*, problem:Problem(*, company:CompanyProfile(*, user:User(*))), student:StudentProfile(*, user:User(*))')
        .single();

      if (error) throw error;

      const studentUserId = Array.isArray(solution.student.user) ? solution.student.user[0].id : solution.student.user.id;
      const companyUserId = Array.isArray(solution.problem.company.user) ? solution.problem.company.user[0].id : solution.problem.company.user.id;
      const studentName = Array.isArray(solution.student.user) ? solution.student.user[0].name : solution.student.user.name;

      // Create notifications
      await Promise.all([
        // Notification for student
        supabase.from('Notification').insert({
            userId: studentUserId,
            type: 'SOLUTION_REVIEWED',
            title: 'Solução Avaliada',
            message: `A sua solução para "${solution.problem.title}" foi ${status.toLowerCase()}.`,
            data: {
              solutionId: solution.id,
              status,
              rating: solution.rating,
              problemTitle: solution.problem.title,
            }
        }),
        // Notification for company
        supabase.from('Notification').insert({
            userId: companyUserId,
            type: 'SOLUTION_REVIEWED',
            title: 'Solução Avaliada',
            message: `Uma solução para o seu desafio "${solution.problem.title}" foi ${status.toLowerCase()}.`,
            data: {
              solutionId: solution.id,
              status,
              studentName: studentName,
            }
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
      // Nota: O Supabase JS Client não suporta agregações complexas (group by, avg) diretamente sem RPC.
      // Para esta migração, vamos buscar os dados brutos e calcular no JS ou usar contagens simples.
      // Em produção, deve-se criar Views ou RPCs no banco de dados.

      const [
        totalUsers,
        activeUsers,
        totalProblems,
        activeProblems,
        featuredProblems,
        totalSolutions,
        acceptedSolutions,
      ] = await Promise.all([
        supabase.from('User').select('*', { count: 'exact', head: true }).then(r => r.count),
        supabase.from('User').select('*', { count: 'exact', head: true }).eq('isActive', true).then(r => r.count),
        supabase.from('Problem').select('*', { count: 'exact', head: true }).then(r => r.count),
        supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE').then(r => r.count),
        supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('isFeatured', true).then(r => r.count),
        supabase.from('Solution').select('*', { count: 'exact', head: true }).then(r => r.count),
        supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('status', 'ACCEPTED').then(r => r.count),
      ]);

      // Cálculos manuais para substituir queryRaw
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: newUsersThisMonth } = await supabase.from('User').select('*', { count: 'exact', head: true }).gte('createdAt', startOfMonth);

      // Fetch para médias (cuidado com performance em produção)
      const { data: solutions } = await supabase.from('Solution').select('rating, likes, submittedAt, reviewedAt').not('rating', 'is', null);
      
      let totalRating = 0;
      let totalLikes = 0;
      let totalResponseTime = 0;
      let responseCount = 0;

      if (solutions) {
        solutions.forEach(s => {
          totalRating += s.rating || 0;
          totalLikes += s.likes || 0;
          if (s.reviewedAt && s.submittedAt) {
            const diff = new Date(s.reviewedAt) - new Date(s.submittedAt);
            totalResponseTime += diff;
            responseCount++;
          }
        });
      }

      const avgRating = solutions?.length ? totalRating / solutions.length : 0;
      const avgResponseDays = responseCount ? (totalResponseTime / responseCount) / (1000 * 60 * 60 * 24) : 0;

      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth || 0,
          growth: [], // Não calculado nesta versão simplificada
        },
        problems: {
          total: totalProblems,
          active: activeProblems,
          featured: featuredProblems,
          totalViews: 0, // Campo views não estava no schema inicial
          mostActiveCategory: 'N/A', // Requer agregação
        },
        solutions: {
          total: totalSolutions,
          accepted: acceptedSolutions,
          acceptanceRate: totalSolutions > 0 ? (acceptedSolutions / totalSolutions) * 100 : 0,
          averageRating: parseFloat(avgRating.toFixed(2)),
          totalLikes: totalLikes,
        },
        platform: {
          averageResponseTime: avgResponseDays.toFixed(1) + ' dias',
          topPerformingStudent: { name: 'N/A', solutions: 0, rating: 0 }, // Requer agregação complexa
          topPublishingCompany: { name: 'N/A', problems: 0 }, // Requer agregação complexa
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
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);

      const [recentUsers, recentProblems, recentSolutions] = await Promise.all([
        supabase.from('User')
          .select('id, name, email, role, createdAt')
          .order('createdAt', { ascending: false })
          .limit(limitNum),
        supabase.from('Problem')
          .select('*, company:CompanyProfile(user:User(name))')
          .order('createdAt', { ascending: false })
          .limit(limitNum),
        supabase.from('Solution')
          .select('*, student:StudentProfile(user:User(name)), problem:Problem(title)')
          .order('submittedAt', { ascending: false })
          .limit(limitNum)
      ]);

      // Normalizar dados para formato de Log
      const userLogs = (recentUsers.data || []).map(u => ({
        id: `user-${u.id}`,
        type: 'USER_REGISTER',
        message: `Novo utilizador registado: ${u.name} (${u.role})`,
        timestamp: u.createdAt,
        data: { userId: u.id, email: u.email }
      }));

      const problemLogs = (recentProblems.data || []).map(p => {
        const companyName = Array.isArray(p.company?.user) ? p.company.user[0]?.name : p.company?.user?.name;
        return {
        id: `prob-${p.id}`,
        type: 'PROBLEM_CREATED',
        message: `Novo desafio criado: "${p.title}" por ${companyName || 'Empresa'}`,
        timestamp: p.createdAt,
        data: { problemId: p.id }
      }});

      const solutionLogs = (recentSolutions.data || []).map(s => {
        const studentName = Array.isArray(s.student?.user) ? s.student.user[0]?.name : s.student?.user?.name;
        return {
        id: `sol-${s.id}`,
        type: 'SOLUTION_SUBMITTED',
        message: `Solução submetida: "${s.title}" por ${studentName || 'Estudante'} para "${s.problem?.title}"`,
        timestamp: s.submittedAt,
        data: { solutionId: s.id }
      }});

      // Combinar e ordenar
      let allLogs = [...userLogs, ...problemLogs, ...solutionLogs];

      // Filtrar por tipo se solicitado
      if (type) {
        allLogs = allLogs.filter(log => log.type === type);
      }

      // Ordenar por data (mais recente primeiro)
      allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Paginação em memória
      const total = allLogs.length;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedLogs = allLogs.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          logs: paginatedLogs,
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
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
      const adminUserId = req.userId;

      // 1. Store the announcement in the database
      let announcement;
      
      // Tenta inserir se a tabela existir, senão usa fallback para não quebrar a notificação
      try {
        const { data, error } = await supabase.from('Announcement').insert({
          title,
          message,
          type,
          targetUsers,
          authorId: adminUserId, // Certifique-se que a coluna existe no DB
        }).select().single();
        
        if (!error && data) announcement = data;
        else announcement = { id: crypto.randomUUID(), title }; // Fallback em memória
      } catch (e) {
        announcement = { id: 'temp-id', title };
      }

      // 2. Create notifications for all users or specific targets
      if (targetUsers === 'ALL') {
        const { data: users } = await supabase.from('User').select('id');

        if (users) {
        for (const user of users) {
          await supabase.from('Notification').insert({
              userId: user.id,
              type: 'SYSTEM_UPDATE',
              title: `Anúncio: ${title}`,
              message,
              data: {
                announcementId: announcement.id,
                type,
              }
          });
        }
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

  static async getMyNotifications(req, res) {
    try {
      const userId = req.userId;
      const { data, error } = await supabase
        .from('Notification')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(20);

      if (error) throw error;

      res.json({ success: true, data });
    } catch (error) {
      console.error('Get my notifications error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar notificações.' });
    }
  }

  static async markNotificationsAsRead(req, res) {
    try {
      const userId = req.userId;

      const { error } = await supabase
        .from('Notification')
        .update({ isRead: true })
        .eq('userId', userId)
        .eq('isRead', false);
      
      if (error) throw error;

      res.json({ success: true, message: 'Notificações marcadas como lidas.' });
    } catch (error) {
      console.error('Mark notifications as read error:', error);
      res.status(500).json({ success: false, message: 'Erro ao marcar notificações.' });
    }
  }

  static async sendSolutionReminder(req, res) {
    try {
      const { id } = req.params; // Solution ID

      const { data: solution, error } = await supabase
        .from('Solution')
        .select('*, problem:Problem(title, company:CompanyProfile(user:User(id, name, email)))')
        .eq('id', id)
        .single();

      if (error || !solution) {
        return res.status(404).json({ success: false, message: 'Solução não encontrada.' });
      }

      const companyUser = Array.isArray(solution.problem?.company?.user) 
        ? solution.problem.company.user[0] 
        : solution.problem?.company?.user;

      if (!companyUser) {
        return res.status(400).json({ success: false, message: 'Empresa não encontrada para este desafio.' });
      }

      // Enviar notificação para a empresa
      await supabase.from('Notification').insert({
        userId: companyUser.id,
        type: 'SYSTEM_UPDATE',
        title: 'Ação Necessária: Revisão de Solução',
        message: `A administração solicita a revisão da solução pendente para o desafio "${solution.problem.title}". Por favor, analise-a brevemente.`,
        data: { solutionId: solution.id, problemId: solution.problemId }
      });

      res.json({ success: true, message: `Lembrete enviado para ${companyUser.name}.` });
    } catch (error) {
      console.error('Send reminder error:', error);
      res.status(500).json({ success: false, message: 'Erro ao enviar lembrete.' });
    }
  }

  // Adicione estes métodos ao seu ficheiro src/controllers/admin.controller.js

  static async getReports(req, res) {
    try {
      // 1. Crescimento de Utilizadores (usando a função SQL)
      const { data: userGrowth, error: growthError } = await supabase.rpc('get_monthly_user_growth');
      if (growthError) throw growthError;

      // 2. Taxa de Conclusão de Desafios
      const { count: totalSolutions } = await supabase.from('Solution').select('*', { count: 'exact', head: true });
      const { count: acceptedSolutions } = await supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('status', 'ACCEPTED');
      const completionRate = totalSolutions > 0 ? (acceptedSolutions / totalSolutions) * 100 : 0;

      // 3. Satisfação das Empresas (média de ratings)
      const { data: ratings, error: ratingError } = await supabase.from('Solution').select('rating').not('rating', 'is', null);
      if (ratingError) throw ratingError;
      const companySatisfaction = ratings.length > 0
        ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
        : 0;

      // 4. Tempo Médio de Resposta
      const { data: reviewTimes, error: timeError } = await supabase.from('Solution').select('submittedAt, reviewedAt').not('reviewedAt', 'is', null);
      if (timeError) throw timeError;
      
      let totalResponseTime = 0;
      reviewTimes.forEach(solution => {
        const submitted = new Date(solution.submittedAt).getTime();
        const reviewed = new Date(solution.reviewedAt).getTime();
        totalResponseTime += (reviewed - submitted);
      });
      const averageResponseTimeInDays = reviewTimes.length > 0
        ? (totalResponseTime / reviewTimes.length) / (1000 * 60 * 60 * 24)
        : 0;

      res.json({
        success: true,
        data: {
          userGrowth: userGrowth || [],
          completionRate: parseFloat(completionRate.toFixed(1)),
          companySatisfaction: parseFloat(companySatisfaction.toFixed(1)),
          averageResponseTime: parseFloat(averageResponseTimeInDays.toFixed(1))
        }
      });

    } catch (error) {
      console.error('Get admin reports error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar dados para relatórios.' });
    }
  }

  static async getSettings(req, res) {
    try {
      const { data, error } = await supabase
        .from('PlatformSettings')
        .select('*')
        .eq('id', true)
        .single();

      if (error) throw error;

      res.json({ success: true, data });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar definições da plataforma.' });
    }
  }

  static async updateSettings(req, res) {
    try {
      const settingsData = req.body;
      delete settingsData.id;
      settingsData.updatedAt = new Date();

      const { data, error } = await supabase
        .from('PlatformSettings')
        .update(settingsData)
        .eq('id', true)
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, message: 'Definições atualizadas com sucesso!', data });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar definições.' });
    }
  }
  static async getSystemHealth(req, res) {
    try {
      // 1. API Status (implícito, se chegamos aqui está online)
      const api = 'Online';

      // 2. DB Status (tenta fazer uma query simples)
      const { error: dbError } = await supabase.from('User').select('id').limit(1);
      const db = dbError ? 'Offline' : 'Online';

      // 3. Storage Usage (uso do disco do servidor)
      const path = os.platform() === 'win32' ? 'c:' : '/';
      const { total, free } = await disk.check(path);
      const used = total - free;
      const storage = total > 0 ? parseFloat(((used / total) * 100).toFixed(1)) : 0;

      // 4. Last Backup (lê da tabela de configurações)
      const { data: settings } = await supabase.from('PlatformSettings').select('lastBackupAt').single();
      
      res.json({
        success: true,
        data: {
          api,
          db,
          storage,
          lastBackup: settings?.lastBackupAt || null,
        },
      });
    } catch (error) {
      console.error('Get system health error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar estado do sistema.',
        data: {
          api: 'Online',
          db: 'Offline',
          storage: 0,
          lastBackup: null,
        }
      });
    }
  }
}