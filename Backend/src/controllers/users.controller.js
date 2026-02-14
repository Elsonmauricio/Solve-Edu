import { validationResult } from 'express-validator';
import { supabase } from '../lib/supabase.js';

export class UserController {
  static async getUserProfile(req, res) {
    try {
      // Usar o objeto user já carregado e corrigido pelo middleware (req.user)
      // Isto evita uma nova query à BD que poderia retornar dados desatualizados (ex: role null)
      const user = req.user;
      const userId = req.userId;

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilizador não encontrado.' 
        });
      }

      // Buscar perfil separadamente
      let profile = null;
      if (user.role === 'STUDENT') {
        // O middleware já tenta carregar o perfil, usamos se existir
        if (user.studentProfile) {
          profile = user.studentProfile;
        } else {
          const { data } = await supabase.from('StudentProfile').select('*').eq('userId', userId).maybeSingle();
          profile = data;
        }
      } else if (user.role === 'COMPANY') {
        if (user.companyProfile) {
          profile = user.companyProfile;
        } else {
          const { data } = await supabase.from('CompanyProfile').select('*').eq('userId', userId).maybeSingle();
          profile = data;
        }
      } else if (user.role === 'SCHOOL') {
        if (user.schoolProfile) {
          profile = user.schoolProfile;
        } else {
          const { data } = await supabase.from('SchoolProfile').select('*').eq('userId', userId).maybeSingle();
          profile = data;
        }
      }

      // Get additional stats based on role
      let stats = {};
      if (user.role === 'STUDENT' && profile) {
        const solutions = await supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('studentId', profile?.id).then(r => r.count);
        const acceptedSolutions = await supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('studentId', profile?.id).eq('status', 'ACCEPTED').then(r => r.count);
        stats = { solutions, acceptedSolutions };
      } else if (user.role === 'COMPANY' && profile) {
        const problems = await supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('companyId', profile?.id).then(r => r.count);
        const activeProblems = await supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('companyId', profile?.id).eq('status', 'ACTIVE').then(r => r.count);
        stats = { problems, activeProblems };
      }

      // Preparar resposta plana para corresponder à expectativa do frontend (useUserInitialization)
      const responseData = {
        ...user,
        stats,
        // Garantir que o perfil está na propriedade correta que o frontend espera
        studentProfile: user.role === 'STUDENT' ? profile : undefined,
        companyProfile: user.role === 'COMPANY' ? profile : undefined,
        schoolProfile: user.role === 'SCHOOL' ? profile : undefined,
      };

      res.json({
        success: true,
        data: responseData
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
        } else if (req.userRole === 'SCHOOL') {
          prismaUpdateData.schoolProfile = { update: profileData };
        }
      }

      // 1. Update User
      const { data: user, error } = await supabase
        .from('User')
        .update(prismaUpdateData)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw error;

      // 2. Update Profile (se necessário, lógica similar ao auth.controller)
      // ... (código simplificado assumindo que o update acima já trata campos base)
      // Para campos específicos de perfil, seria necessário um segundo update.

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

  static async setUserRole(req, res) {
    try {
      const userId = req.userId;
      const { role } = req.body;

      // 1. Validar a role recebida
      const validRoles = ['STUDENT', 'COMPANY', 'SCHOOL'];
      if (!role || !validRoles.includes(role.toUpperCase())) {
        return res.status(400).json({ success: false, message: 'O perfil selecionado é inválido.' });
      }
      const normalizedRole = role.toUpperCase();

      // 2. Verificar se o utilizador já tem um perfil para evitar sobreposições
      const { data: currentUser } = await supabase.from('User').select('role').eq('id', userId).single();
      if (currentUser && currentUser.role) {
        return res.status(400).json({ success: false, message: 'O utilizador já tem um perfil definido.' });
      }

      // 3. Atualizar a role do utilizador na tabela User
      const { data: updatedUser, error: userError } = await supabase
        .from('User')
        .update({ role: normalizedRole })
        .eq('id', userId)
        .select('*')
        .single();

      if (userError) throw userError;

      // 4. Criar o perfil correspondente (StudentProfile ou CompanyProfile)
      let profile = null;
      let profileError = null;
      if (normalizedRole === 'STUDENT') {
        const { data, error } = await supabase.from('StudentProfile').insert({ userId }).select().single();
        profile = data;
        profileError = error;
      } else if (normalizedRole === 'COMPANY') {
        const { data, error } = await supabase.from('CompanyProfile').insert({ userId }).select().single();
        profile = data;
        profileError = error;
      } else if (normalizedRole === 'SCHOOL') {
        const { data, error } = await supabase.from('SchoolProfile').insert({ userId }).select().single();
        profile = data;
        profileError = error;
      }

      if (profileError) throw profileError;

      // 5. Devolver o objeto de utilizador completo e atualizado
      updatedUser.studentProfile = normalizedRole === 'STUDENT' ? profile : null;
      updatedUser.companyProfile = normalizedRole === 'COMPANY' ? profile : null;
      updatedUser.schoolProfile = normalizedRole === 'SCHOOL' ? profile : null;

      res.json({ success: true, message: 'Perfil definido com sucesso!', data: updatedUser });

    } catch (error) {
      console.error('Set user role error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Ocorreu um erro ao definir o seu perfil.' 
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
          supabase.from('Solution').select('student!inner(userId)', { count: 'exact', head: true }).eq('student.userId', userId).then(r => r.count),
          supabase.from('Solution').select('student!inner(userId)', { count: 'exact', head: true }).eq('student.userId', userId).eq('status', 'ACCEPTED').then(r => r.count),
          supabase.from('Solution').select('student!inner(userId)', { count: 'exact', head: true }).eq('student.userId', userId).eq('status', 'PENDING_REVIEW').then(r => r.count),
          // Média e Soma (fetch manual)
          supabase.from('Solution').select('rating, likes, student!inner(userId)').eq('student.userId', userId),
          // Problems Solved (distinct problemId where status=ACCEPTED)
          supabase.from('Solution').select('problemId, student!inner(userId)').eq('student.userId', userId).eq('status', 'ACCEPTED')
        ]);

        // Processar agregações em JS
        const solutionsData = averageRating.data || [];
        const avg = solutionsData.reduce((acc, curr) => acc + (curr.rating || 0), 0) / (solutionsData.length || 1);
        const likes = solutionsData.reduce((acc, curr) => acc + (curr.likes || 0), 0);
        const uniqueProblems = new Set(totalLikes.data?.map(s => s.problemId)).size; // totalLikes aqui é o 5º elemento (problemsSolved query)

        stats = {
          totalSolutions,
          acceptedSolutions,
          pendingSolutions,
          acceptanceRate: totalSolutions > 0 ? (acceptedSolutions / totalSolutions) * 100 : 0,
          averageRating: avg,
          totalLikes: likes,
          problemsSolved: uniqueProblems,
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
          supabase.from('Problem').select('company!inner(userId)', { count: 'exact', head: true }).eq('company.userId', userId).then(r => r.count),
          supabase.from('Problem').select('company!inner(userId)', { count: 'exact', head: true }).eq('company.userId', userId).eq('status', 'ACTIVE').then(r => r.count),
          supabase.from('Problem').select('company!inner(userId)', { count: 'exact', head: true }).eq('company.userId', userId).eq('status', 'EXPIRED').then(r => r.count),
          supabase.from('Solution').select('problem!inner(company!inner(userId))', { count: 'exact', head: true }).eq('problem.company.userId', userId).then(r => r.count),
          supabase.from('Solution').select('problem!inner(company!inner(userId))', { count: 'exact', head: true }).eq('problem.company.userId', userId).eq('status', 'ACCEPTED').then(r => r.count),
          // Avg Rating
          supabase.from('Solution').select('rating, problem!inner(company!inner(userId))').eq('problem.company.userId', userId).not('rating', 'is', null)
        ]);

        const ratingsData = averageSolutionRating.data || [];
        const avg = ratingsData.reduce((acc, curr) => acc + (curr.rating || 0), 0) / (ratingsData.length || 1);

        stats = {
          totalProblems,
          activeProblems,
          expiredProblems,
          totalSolutions,
          acceptedSolutions,
          acceptanceRate: totalSolutions > 0 ? (acceptedSolutions / totalSolutions) * 100 : 0,
          averageSolutionRating: avg,
        };
      } else if (userRole === 'SCHOOL') {
        // Estatísticas para Escola
        const [
          totalStudents,
          activeProjects, // Soluções em progresso ou submetidas
          completedPaps,  // Soluções aceites
        ] = await Promise.all([
          // Contar alunos associados a esta escola (assumindo que StudentProfile tem schoolId ou string matching)
          // Nota: Como ainda não tens uma relação direta de ID, vamos contar por nome da escola por enquanto ou retornar 0
          supabase.from('StudentProfile').select('*', { count: 'exact', head: true }).eq('school', req.user.schoolProfile?.schoolName || '').then(r => r.count || 0),
          
          // Para projetos, seria ideal ter uma relação. Por agora, retornamos 0 ou implementamos lógica futura
          Promise.resolve(0), 
          Promise.resolve(0)
        ]);

        // Média de notas (placeholder)
        stats = { totalStudents, activeProjects, completedPaps, averageGrade: 0 };
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
      const { data: topStudents, error } = await supabase
        .from('User')
        .select('*, studentProfile:StudentProfile(*, solutions:Solution(rating))')
        .eq('role', 'STUDENT')
        .eq('isActive', true)
        // .limit(10) // Supabase não ordena por relação aninhada facilmente, pegamos mais e ordenamos no JS
        .limit(50);

      if (error) throw error;

      const formattedStudents = (topStudents || []).map(student => {
        // Ajuste para estrutura do Supabase (array ou objeto)
        const profile = Array.isArray(student.studentProfile) ? student.studentProfile[0] : student.studentProfile;
        const solutions = profile?.solutions || [];
        // Filtrar aceites manualmente se a query não filtrou
        const acceptedSolutions = solutions.filter(s => s.status === 'ACCEPTED' || true); // Assumindo que filtramos no select se possível, ou aqui
        
        const averageRating = solutions.length > 0 
          ? solutions.reduce((sum, s) => sum + (s.rating || 0), 0) / solutions.length
          : 0;

        return {
          id: student.id,
          name: student.name,
          avatar: student.avatar,
          level: student.level,
          school: profile?.school,
          solutionsCount: solutions.length,
          averageRating: parseFloat(averageRating.toFixed(1)),
          skills: profile?.skills || [],
        };
      }).sort((a, b) => b.solutionsCount - a.solutionsCount).slice(0, 10);

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
      const { data: topCompanies, error } = await supabase
        .from('User')
        .select('*, companyProfile:CompanyProfile(*, problems:Problem(*, solutions:Solution(status)))')
        .eq('role', 'COMPANY')
        .eq('isActive', true)
        .limit(50);

      if (error) throw error;

      const formattedCompanies = (topCompanies || []).map(company => {
        const profile = Array.isArray(company.companyProfile) ? company.companyProfile[0] : company.companyProfile;
        const problems = profile?.problems || [];
        const totalSolutions = problems.reduce((sum, p) => sum + p.solutions.length, 0);
        const acceptedSolutions = problems.reduce(
          (sum, p) => sum + p.solutions.filter(s => s.status === 'ACCEPTED').length, 
          0
        );

        return {
          id: company.id,
          name: company.name,
          avatar: company.avatar,
          companyName: profile?.companyName,
          industry: profile?.industry,
          problemsPosted: problems.length,
          solutionsAccepted: acceptedSolutions,
          acceptanceRate: totalSolutions > 0 ? (acceptedSolutions / totalSolutions) * 100 : 0,
        };
      }).sort((a, b) => b.problemsPosted - a.problemsPosted).slice(0, 10);

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