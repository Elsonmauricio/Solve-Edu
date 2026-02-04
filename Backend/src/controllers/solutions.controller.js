import { validationResult } from 'express-validator';
import { storageService } from '../services/storage.service.js';
import { supabase } from '../lib/supabase.js';
import emailService from '../services/email.service.js';

export class SolutionController {
  static async createSolution(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const studentId = req.studentId;
      const { problemId } = req.body;

      // Check if problem exists and is active
      const { data: problem } = await supabase
        .from('Problem')
        .select('*, company:CompanyProfile(*, user:User(*))')
        .eq('id', problemId)
        .single();

      if (!problem) {
        return res.status(404).json({ 
          success: false, 
          message: 'Desafio não encontrado.' 
        });
      }

      if (problem.status !== 'ACTIVE') {
        return res.status(400).json({ 
          success: false, 
          message: 'Este desafio não está ativo.' 
        });
      }

      // Check if student has already submitted a solution
      const { data: existingSolution } = await supabase
        .from('Solution')
        .select('*')
        .eq('problemId', problemId)
        .eq('studentId', studentId)
        .maybeSingle();

      if (existingSolution && existingSolution.status !== 'REJECTED') {
        return res.status(400).json({ 
          success: false, 
          message: 'Já submeteu uma solução para este desafio.' 
        });
      }

      // 1. Upload do ficheiro para o Supabase (se existir)
      let fileUrls = [];
      if (req.file) {
        // Faz o upload para o bucket 'solutions'
        const url = await storageService.uploadFile(req.file, 'solutions');
        if (url) fileUrls.push(url);
      }

      // Create solution
      const solutionData = {
        ...req.body,
        studentId,
        status: 'PENDING_REVIEW',
        files: fileUrls, // Guarda o URL do ficheiro no array de ficheiros
        submittedAt: new Date(),
      };

      const { data: solution, error: createError } = await supabase
        .from('Solution')
        .insert(solutionData)
        .select()
        .single();

      if (createError) throw createError;

      // Create notification for company
      // Nota: A relação para obter o `userId` da empresa precisa de um include
      if (problem.company?.user?.id) { // Nota: Com supabase a estrutura pode vir como array se for 1:N, mas aqui assumimos 1:1
        const companyUserId = Array.isArray(problem.company.user) ? problem.company.user[0].id : problem.company.user.id;
        
        await supabase.from('Notification').insert({
            userId: problem.company.user.id,
            type: 'SOLUTION_SUBMITTED',
            title: 'Nova Solução Submetida',
            message: `Uma nova solução foi submetida para o seu desafio "${problem.title}"`,
            data: {
              problemId: problem.id,
              solutionId: solution.id,
              studentName: req.userName,
            }
        });

        // Enviar email para a empresa
        if (problem.company.user.email) {
          await emailService.sendSolutionSubmittedEmail(
            problem.company.user.email,
            req.userName,
            problem.title,
            solution.id
          );
        }
      }

      res.status(201).json({
        success: true,
        message: 'Solução submetida com sucesso!',
        data: solution,
      });

    } catch (error) {
      console.error('Create solution error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao submeter solução.' 
      });
    }
  }

  static async getSolutions(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        problemId,
        studentId,
        status,
        search,
        sortBy = 'submittedAt',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      let query = supabase
        .from('Solution')
        .select('*, student:StudentProfile(*, user:User(name, avatar)), problem:Problem(title)', { count: 'exact' });

      if (problemId) query = query.eq('problemId', problemId);
      if (studentId) query = query.eq('studentId', studentId);
      if (status) query = query.eq('status', status);
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
                   .range(skip, skip + limitNum - 1);

      const { data: solutions, count: total, error } = await query;

      if (error) throw error;

      const result = {
        data: solutions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        }
      };
      
      res.json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Get solutions error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar soluções.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getSolution(req, res) {
    try {
      const { id } = req.params;

      const { data: solution, error } = await supabase
        .from('Solution')
        .select('*, student:StudentProfile(*, user:User(*)), problem:Problem(*, company:CompanyProfile(*, user:User(*)))')
        .eq('id', id)
        .single();

      if (!solution) {
        return res.status(404).json({ 
          success: false, 
          message: 'Solução não encontrada.' 
        });
      }

      // Helper para extrair user ID de estruturas aninhadas do Supabase
      const getUserId = (profile) => profile?.user?.id || (Array.isArray(profile?.user) ? profile.user[0]?.id : null);

      // Check authorization
      const canView = 
        req.userRole === 'ADMIN' ||
        getUserId(solution.student) === req.userId ||
        getUserId(solution.problem?.company) === req.userId;

      if (!canView) {
        return res.status(403).json({ 
          success: false, 
          message: 'Não tem permissão para ver esta solução.' 
        });
      }

      res.json({
        success: true,
        data: solution,
      });

    } catch (error) {
      console.error('Get solution error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar solução.' 
      });
    }
  }

  static async updateSolution(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updateData = req.body;

      // Check if solution exists
      const { data: existingSolution } = await supabase
        .from('Solution')
        .select('*, student:StudentProfile(*, user:User(*))')
        .eq('id', id)
        .single();

      if (!existingSolution) {
        return res.status(404).json({ 
          success: false, 
          message: 'Solução não encontrada.' 
        });
      }

      const getUserId = (profile) => profile?.user?.id || (Array.isArray(profile?.user) ? profile.user[0]?.id : null);

      // Check authorization
      const canUpdate = 
        req.userRole === 'ADMIN' ||
        getUserId(existingSolution.student) === req.userId;

      if (!canUpdate) {
        return res.status(403).json({ 
          success: false, 
          message: 'Não tem permissão para atualizar esta solução.' 
        });
      }

      // Students can only update certain fields
      if (req.userRole === 'STUDENT') {
        const allowedFields = ['title', 'description', 'technologies', 'githubUrl', 'demoUrl', 'documentation', 'files'];
        Object.keys(updateData).forEach(key => {
          if (!allowedFields.includes(key)) {
            delete updateData[key];
          }
        });
      }

      const { data: solution, error } = await supabase
        .from('Solution')
        .update(updateData)
        .eq('id', id)
        .select('*, student:StudentProfile(*, user:User(*)), problem:Problem(*)')
        .single();

      if (error) throw error;

      // Create notification if status changed by company/admin
      if (req.userRole !== 'STUDENT' && updateData.status && updateData.status !== existingSolution.status) {
        const studentUserId = getUserId(solution.student);
        await supabase.from('Notification').insert({
            userId: studentUserId,
            type: 'SOLUTION_REVIEWED',
            title: 'Solução Avaliada',
            message: `A sua solução para "${solution.problem.title}" foi ${updateData.status.toLowerCase()}`,
            data: {
              problemId: solution.problem.id,
              solutionId: solution.id,
              status: updateData.status,
              feedback: updateData.feedback,
            }
        });

        // Enviar email para o estudante
        const studentEmail = solution.student?.user?.email || (Array.isArray(solution.student?.user) ? solution.student.user[0]?.email : null);
        if (studentEmail) {
          await emailService.sendSolutionReviewedEmail(
            studentEmail,
            solution.student?.user?.name || 'Estudante',
            solution.problem.title,
            updateData.status,
            updateData.feedback
          );
        }
      }

      res.json({
        success: true,
        message: 'Solução atualizada com sucesso!',
        data: solution,
      });

    } catch (error) {
      console.error('Update solution error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar solução.' 
      });
    }
  }

  static async deleteSolution(req, res) {
    try {
      const { id } = req.params;

      // Check if solution exists
      const { data: existingSolution } = await supabase
        .from('Solution')
        .select('*, student:StudentProfile(*, user:User(*))')
        .eq('id', id)
        .single();

      if (!existingSolution) {
        return res.status(404).json({ 
          success: false, 
          message: 'Solução não encontrada.' 
        });
      }

      const getUserId = (profile) => profile?.user?.id || (Array.isArray(profile?.user) ? profile.user[0]?.id : null);

      // Check authorization
      const canDelete = 
        req.userRole === 'ADMIN' ||
        getUserId(existingSolution.student) === req.userId;

      if (!canDelete) {
        return res.status(403).json({ 
          success: false, 
          message: 'Não tem permissão para eliminar esta solução.' 
        });
      }

      await supabase.from('Solution').delete().eq('id', id);

      res.json({
        success: true,
        message: 'Solução eliminada com sucesso!',
      });

    } catch (error) {
      console.error('Delete solution error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao eliminar solução.' 
      });
    }
  }

  static async getStudentSolutions(req, res) {
    try {
      const studentId = req.studentId || req.params.studentId;

      const { data: solutions, error } = await supabase
        .from('Solution')
        .select('*, problem:Problem(title, category)')
        .eq('studentId', studentId);

      res.json({
        success: true,
        data: solutions,
      });

    } catch (error) {
      console.error('Get student solutions error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar soluções do estudante.' 
      });
    }
  }

  static async getProblemSolutions(req, res) {
    try {
      const { problemId } = req.params;

      // Check if user can view solutions
      const { data: problem } = await supabase
        .from('Problem')
        .select('*, company:CompanyProfile(*, user:User(*))')
        .eq('id', problemId)
        .single();

      if (!problem) {
        return res.status(404).json({ 
          success: false, 
          message: 'Desafio não encontrado.' 
        });
      }

      const getUserId = (profile) => profile?.user?.id || (Array.isArray(profile?.user) ? profile.user[0]?.id : null);

      const canView = 
        req.userRole === 'ADMIN' ||
        getUserId(problem.company) === req.userId;

      if (!canView) {
        return res.status(403).json({ 
          success: false, 
          message: 'Não tem permissão para ver as soluções deste desafio.' 
        });
      }

      const { data: solutions } = await supabase
        .from('Solution')
        .select('*, student:StudentProfile(*, user:User(name, avatar))')
        .eq('problemId', problemId);

      res.json({
        success: true,
        data: solutions,
      });

    } catch (error) {
      console.error('Get problem solutions error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar soluções do desafio.' 
      });
    }
  }

  static async likeSolution(req, res) {
    try {
      const { id } = req.params;

      const { data: solution } = await supabase
        .from('Solution')
        .select('likes')
        .eq('id', id)
        .single();

      if (!solution) {
        return res.status(404).json({ 
          success: false, 
          message: 'Solução não encontrada.' 
        });
      }

      await supabase
        .from('Solution')
        .update({ likes: (solution.likes || 0) + 1 })
        .eq('id', id);

      res.json({
        success: true,
        message: 'Solução marcada como gostei!',
        data: { likes: solution.likes + 1 },
      });

    } catch (error) {
      console.error('Like solution error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao marcar solução.' 
      });
    }
  }

  static async getTopSolutions(req, res) {
    try {
      const { data: solutions } = await supabase
        .from('Solution')
        .select('*, student:StudentProfile(*, user:User(*)), problem:Problem(*)')
        .eq('status', 'ACCEPTED')
        .order('rating', { ascending: false })
        .limit(10);

      res.json({
        success: true,
        data: solutions,
      });

    } catch (error) {
      console.error('Get top solutions error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar melhores soluções.' 
      });
    }
  }

  static async getStats(req, res) {
    try {
      const { count: total } = await supabase.from('Solution').select('*', { count: 'exact', head: true });
      const { count: accepted } = await supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('status', 'ACCEPTED');
      const { count: pending } = await supabase.from('Solution').select('*', { count: 'exact', head: true }).eq('status', 'PENDING_REVIEW');

      const stats = {
        total,
        accepted,
        pending,
        acceptanceRate: total > 0 ? (accepted / total) * 100 : 0
      };

      res.json({
        success: true,
        data: stats,
      });

    } catch (error) {
      console.error('Get solutions stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar estatísticas.' 
      });
    }
  }
}