import { validationResult } from 'express-validator';
import { supabase } from '../lib/supabase.js';
import asyncHandler from '../utils/asyncHandler.js';

export class UserController {
  static getUserProfile = asyncHandler(async (req, res) => {
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
      } else if (user.role === 'MENTOR') {
        if (user.mentorProfile) {
          profile = user.mentorProfile;
        } else {
          const { data } = await supabase.from('MentorProfile').select('*').eq('userId', userId).maybeSingle();
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
        mentorProfile: user.role === 'MENTOR' ? profile : undefined,
      };

      res.json({
        success: true,
        data: responseData
      });
  }); // Garante o fechamento correto do asyncHandler

  static updateUserProfile = asyncHandler(async (req, res) => {
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
      
      const userUpdateData = { ...updateData };

      // 1. Update User base fields (if any)
      let updatedUser = null;
      if (Object.keys(userUpdateData).length > 0) {
        const { data: user, error } = await supabase
          .from('User')
          .update(userUpdateData)
          .eq('id', userId)
          .select('*')
          .single();

        if (error) throw error;
        updatedUser = user;
      } else {
        const { data: user } = await supabase.from('User').select('*').eq('id', userId).single();
        updatedUser = user;
      }

      // 2. Update Profile fields
      let updatedProfile = null;
      if (profileData && Object.keys(profileData).length > 0) {
        if (req.userRole === 'STUDENT') {
          const { data, error } = await supabase.from('StudentProfile').update(profileData).eq('userId', userId).select('*').single();
          if (error) throw error;
          updatedProfile = data;
          updatedUser.studentProfile = updatedProfile;
        } else if (req.userRole === 'COMPANY') {
          const { data, error } = await supabase.from('CompanyProfile').update(profileData).eq('userId', userId).select('*').single();
          if (error) throw error;
          updatedProfile = data;
          updatedUser.companyProfile = updatedProfile;
        } else if (req.userRole === 'SCHOOL') {
          const { data, error } = await supabase.from('SchoolProfile').update(profileData).eq('userId', userId).select('*').single();
          if (error) throw error;
          updatedProfile = data;
          updatedUser.schoolProfile = updatedProfile;
        } else if (req.userRole === 'MENTOR') {
          const { data, error } = await supabase.from('MentorProfile').update(profileData).eq('userId', userId).select('*').single();
          if (error) throw error;
          updatedProfile = data;
          updatedUser.mentorProfile = updatedProfile;
        }
      }

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        data: { user: updatedUser }
      });
  }); // Garante o fechamento correto do asyncHandler

  static setUserRole = asyncHandler(async (req, res) => {
      const userId = req.userId;
      const { role } = req.body;

      // 1. Validar a role recebida
      const validRoles = ['STUDENT', 'COMPANY', 'SCHOOL', 'MENTOR'];
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
      } else if (normalizedRole === 'MENTOR') {
        const { data, error } = await supabase.from('MentorProfile').insert({ userId }).select().single();
        profile = data;
        profileError = error;
      }

      if (profileError) throw profileError;

      // 5. Devolver o objeto de utilizador completo e atualizado
      updatedUser.studentProfile = normalizedRole === 'STUDENT' ? profile : null;
      updatedUser.companyProfile = normalizedRole === 'COMPANY' ? profile : null;
      updatedUser.schoolProfile = normalizedRole === 'SCHOOL' ? profile : null;
      updatedUser.mentorProfile = normalizedRole === 'MENTOR' ? profile : null;

      res.json({ success: true, message: 'Perfil definido com sucesso!', data: updatedUser });
  }); // Garante o fechamento correto do asyncHandler

  static getUserStats = asyncHandler(async (req, res) => {
      const userId = req.userId;
      const userRole = req.userRole;
      const studentId = req.studentId;
      const companyId = req.companyId;

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
          supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('studentId', studentId).then(r => r.count),
          supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('studentId', studentId).eq('status', 'ACCEPTED').then(r => r.count),
          supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('studentId', studentId).eq('status', 'PENDING_REVIEW').then(r => r.count),
          // Média e Soma (fetch manual)
          supabase.from('Solution').select('rating, likes, problemId').eq('studentId', studentId),
          // Problems Solved (distinct problemId where status=ACCEPTED)
          supabase.from('Solution').select('problemId').eq('studentId', studentId).eq('status', 'ACCEPTED')
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
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);

        const [
          totalProblems,
          activeProblems,
          expiredProblems,
          totalSolutions,
          acceptedSolutions,
          averageSolutionRating,
          newProblemsToday,
          newSolutionsToday,
          newlyAcceptedSolutionsToday,
        ] = await Promise.all([
          supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('companyId', companyId).then(r => r.count),
          supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('companyId', companyId).eq('status', 'ACTIVE').then(r => r.count),
          supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('companyId', companyId).eq('status', 'EXPIRED').then(r => r.count),
          supabase.from('Solution').select('problem!inner(companyId)', { count: 'exact', head: true }).eq('problem.companyId', companyId).then(r => r.count),
          supabase.from('Solution').select('problem!inner(companyId)', { count: 'exact', head: true }).eq('problem.companyId', companyId).eq('status', 'ACCEPTED').then(r => r.count),
          // Avg Rating
          supabase.from('Solution').select('rating, problem!inner(companyId)').eq('problem.companyId', companyId).not('rating', 'is', null),
          // Novas métricas diárias
          supabase.from('Problem').select('*', { count: 'exact', head: true }).eq('companyId', companyId).gte('createdAt', startOfDay.toISOString()).then(r => r.count),
          supabase.from('Solution').select('problem!inner(companyId)', { count: 'exact', head: true }).eq('problem.companyId', companyId).gte('submittedAt', startOfDay.toISOString()).then(r => r.count),
          supabase.from('Solution').select('problem!inner(companyId)', { count: 'exact', head: true }).eq('problem.companyId', companyId).eq('status', 'ACCEPTED').gte('reviewedAt', startOfDay.toISOString()).then(r => r.count),
        ]);

        const ratingsData = averageSolutionRating.data || [];
        const avg = ratingsData.reduce((acc, curr) => acc + (curr.rating || 0), 0) / (ratingsData.length || 1);

        // Cálculo da taxa de expiração no backend
        const totalTrackedProblems = activeProblems + expiredProblems;
        const expiredRate = totalTrackedProblems > 0 ? (expiredProblems / totalTrackedProblems) * 100 : 0;

        stats = {
          totalProblems,
          activeProblems,
          expiredProblems,
          totalSolutions,
          acceptedSolutions,
          acceptanceRate: totalSolutions > 0 ? (acceptedSolutions / totalSolutions) * 100 : 0,
          averageSolutionRating: avg,
          // Novas estatísticas
          newProblemsToday: newProblemsToday || 0,
          newSolutionsToday: newSolutionsToday || 0,
          newlyAcceptedSolutionsToday: newlyAcceptedSolutionsToday || 0,
          expiredRate: expiredRate,
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
          supabase.from('Solution').select('id, student!inner(schoolProfileId)', { count: 'exact', head: true }).eq('student.schoolProfileId', req.schoolId).then(r => r.count || 0),
          supabase.from('Solution').select('id, student!inner(schoolProfileId)', { count: 'exact', head: true }).eq('student.schoolProfileId', req.schoolId).eq('status', 'ACCEPTED').then(r => r.count || 0)
        ]);

        // Média de notas (placeholder)
        stats = { totalStudents, activeProjects, completedPaps, averageGrade: 0 };
      } else if (userRole === 'MENTOR') {
        stats = { mentoredStudents: 0, reviewsPending: 0, sessionHours: 0 };
      }

      res.json({
        success: true,
        data: stats,
      });
  }); // Garante o fechamento correto do asyncHandler

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
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (page - 1) * limit;

      let query = supabase
        .from('User')
        .select('id, email, name, role, avatar, isVerified, isActive, createdAt', { count: 'exact' });

      if (role) {
        query = query.eq('role', role);
      }
      
      if (isVerified !== undefined) {
        query = query.eq('isVerified', isVerified === 'true');
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      query = query.order('createdAt', { ascending: false })
                   .range(skip, skip + limitNum - 1);

      const { data: users, count: total, error } = await query;

      if (error) throw error;

      res.json({
        success: true,
        data: {
          users,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
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

      const { data: user, error } = await supabase
        .from('User')
        .select('*, studentProfile:StudentProfile(*), companyProfile:CompanyProfile(*)')
        .eq('id', id)
        .single();

      if (error || !user) {
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

      const { data: user, error } = await supabase
        .from('User')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

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

      const { error } = await supabase
        .from('User')
        .delete()
        .eq('id', id);

      if (error) throw error;

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