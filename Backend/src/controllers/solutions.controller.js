import { validationResult } from 'express-validator';
import { storageService } from '../services/storage.service.js';
import { supabase } from '../lib/supabase.js';
import emailService from '../services/email.service.js';
import ExcelJS from 'exceljs';

export class SolutionController {
  static async createSolution(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Devolve a primeira mensagem de erro para ser mostrada no toast do frontend
        return res.status(400).json({ 
          success: false, 
          message: errors.array()[0].msg, 
          errors: errors.array() 
        });
      }

      const studentId = req.studentId;
      const { title, description, problemId, technologies, githubUrl, demoUrl, documentation } = req.body;

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
        // O storageService já cria um nome de ficheiro único
        const url = await storageService.uploadFile(req.file, 'solutions');
        if (url) fileUrls.push(url);
      }

      // Create solution
      const solutionData = {
        title,
        description,
        problemId,
        technologies, // Vem como array do sanitizer
        studentId,
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
        documentation: documentation || null,
        status: 'PENDING_REVIEW',
        files: fileUrls, // Guarda o URL do ficheiro no array de ficheiros
        submittedAt: new Date(),
      };

      const { data: solution, error: createError } = await supabase
        .from('Solution')
        .insert(solutionData)
        .select()
        .single();

      if (createError) {
        console.error('Erro Supabase ao inserir solução:', createError);
        // Trata erros específicos do Supabase
        if (createError.code === '23503') { // foreign key violation
          const message = createError.details?.includes('problemId')
            ? 'O desafio associado não foi encontrado.'
            : 'O perfil do estudante não foi encontrado. Por favor, tente fazer login novamente.';
          return res.status(400).json({ success: false, message: message, code: 'FK_VIOLATION' });
        }
        throw createError;
      }

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
          try {
            await emailService.sendSolutionSubmittedEmail(
              problem.company.user.email,
              req.userName,
              problem.title,
              solution.id
            );
          } catch (emailError) {
            console.error('Aviso: Falha ao enviar email (verifique as credenciais SMTP):', emailError.message);
          }
        }
      }

      // Notificar o frontend (Admin Dashboard) em tempo real sobre a nova métrica
      await supabase.channel('platform-metrics').send({
        type: 'broadcast',
        event: 'metrics-update',
        payload: { trigger: 'new_solution', solutionId: solution.id }
      });

      res.status(201).json({
        success: true,
        message: 'Solução submetida com sucesso!',
        data: solution,
      });

    } catch (error) {
      console.error('Create solution error:', error);

      // Dica específica para erro de cache de schema (PGRST204)
      if (error.code === 'PGRST204') {
        console.error('⚠️ ALERTA: A cache do Supabase está desatualizada ou faltam colunas na tabela Solution. Execute "NOTIFY pgrst, \'reload config\';" no SQL Editor.');
      }

      res.status(500).json({ 
        success: false, 
        message: error.message || 'Erro ao submeter solução.',
        error: error.details || 'Erro desconhecido'
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
        companyId,
        status,
        search,
        sortBy = 'submittedAt',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Base query
      let selectQuery = '*, student:StudentProfile(*, user:User(name, avatar))';
      
      // Se filtrarmos por companyId, precisamos de fazer inner join com Problem
      if (companyId) {
        selectQuery += ', problem:Problem!inner(title, companyId)';
      } else {
        selectQuery += ', problem:Problem(title)';
      }

      let query = supabase.from('Solution').select(selectQuery, { count: 'exact' });

      if (problemId) query = query.eq('problemId', problemId);
      if (studentId) query = query.eq('studentId', studentId);
      if (companyId) query = query.eq('problem.companyId', companyId);
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

      // Obter contagem de likes e interações do utilizador atual
      const { count: likeCount } = await supabase
        .from('SolutionInteraction')
        .select('*', { count: 'exact', head: true })
        .eq('solutionId', id)
        .eq('type', 'LIKE');

      solution.likes = likeCount || 0;

      // Verificar interações do utilizador atual (se estiver logado)
      solution.isLiked = false;
      solution.isBookmarked = false;
      if (req.userId) {
        const { data: interactions } = await supabase
          .from('SolutionInteraction')
          .select('type')
          .eq('solutionId', id)
          .eq('userId', req.userId);
        
        if (interactions) {
          solution.isLiked = interactions.some(i => i.type === 'LIKE');
          solution.isBookmarked = interactions.some(i => i.type === 'BOOKMARK');
        }
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
        .select('*, student:StudentProfile(*, user:User(*)), problem:Problem(*, company:CompanyProfile(*, user:User(*)))')
        .eq('id', id)
        .single();

      if (!existingSolution) {
        return res.status(404).json({ 
          success: false, 
          message: 'Solução não encontrada.' 
        });
      }

      const getUserId = (profile) => profile?.user?.id || (Array.isArray(profile?.user) ? profile.user[0]?.id : null);

      const isStudentOwner = getUserId(existingSolution.student) === req.userId;
      const isCompanyOwner = getUserId(existingSolution.problem?.company) === req.userId;

      // Check authorization
      const canUpdate = 
        req.userRole === 'ADMIN' || isStudentOwner || isCompanyOwner;

      if (!canUpdate) {
        return res.status(403).json({ 
          success: false, 
          message: 'Não tem permissão para atualizar esta solução.' 
        });
      }

      // Define allowed fields based on role
      if (isStudentOwner && req.userRole !== 'ADMIN') {
        const allowedFields = ['title', 'description', 'technologies', 'githubUrl', 'demoUrl', 'documentation', 'files'];
        Object.keys(updateData).forEach(key => {
          if (!allowedFields.includes(key)) {
            delete updateData[key];
          }
        });
      } else if (isCompanyOwner && req.userRole !== 'ADMIN') {
        const allowedFields = ['status', 'rating', 'feedback'];
        Object.keys(updateData).forEach(key => {
          if (!allowedFields.includes(key)) {
            delete updateData[key];
          }
        });

        // Atualizar a data de revisão se o estado estiver a ser alterado
        if (updateData.status) {
          updateData.reviewedAt = new Date();
        }
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

      // Notificar o dashboard admin em tempo real se houver mudança de estado ou rating
      // Isto garante que as métricas de "Satisfação" e "Taxa de Aceitação" atualizem instantaneamente
      if (updateData.status || updateData.rating) {
        await supabase.channel('platform-metrics').send({
          type: 'broadcast',
          event: 'metrics-update',
          payload: { trigger: 'solution_updated', solutionId: solution.id }
        });
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

  static async toggleInteraction(req, res) {
    try {
      const { id } = req.params; // solutionId
      const { type } = req.body; // 'LIKE' ou 'BOOKMARK'
      const userId = req.userId;

      if (!['LIKE', 'BOOKMARK'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Tipo de interação inválido.' });
      }

      const { data: existing } = await supabase
        .from('SolutionInteraction')
        .select('id')
        .eq('solutionId', id)
        .eq('userId', userId)
        .eq('type', type)
        .maybeSingle();

      let isSet = false;
      if (existing) {
        await supabase.from('SolutionInteraction').delete().match({ id: existing.id });
      } else {
        await supabase.from('SolutionInteraction').insert({ solutionId: id, userId, type });
        isSet = true;
      }

      const { count } = await supabase.from('SolutionInteraction').select('*', { count: 'exact', head: true }).eq('solutionId', id).eq('type', 'LIKE');

      res.json({ success: true, data: { isSet, likes: count } });
    } catch (error) {
      console.error(`Toggle ${type} error:`, error);
      res.status(500).json({ success: false, message: 'Erro ao interagir com a solução.' });
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
        data: solutions || [],
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

      // Calcular média de avaliações global
      const { data: ratings } = await supabase
        .from('Solution')
        .select('rating')
        .not('rating', 'is', null);
      
      const avgRating = ratings?.length 
        ? (ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratings.length) 
        : 0;

      const stats = {
        total,
        accepted,
        pending,
        acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
        averageRating: avgRating
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

  static async getStudentStats(req, res) {
    try {
      const { studentId } = req.params;
      
      const { count: total } = await supabase
        .from('Solution')
        .select('*', { count: 'exact', head: true })
        .eq('studentId', studentId);

      const { count: accepted } = await supabase
        .from('Solution')
        .select('*', { count: 'exact', head: true })
        .eq('studentId', studentId)
        .eq('status', 'ACCEPTED');

      // Calcular média de avaliações
      const { data: ratings } = await supabase
        .from('Solution')
        .select('rating')
        .eq('studentId', studentId)
        .not('rating', 'is', null);
      
      const avgRating = ratings?.length 
        ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1) 
        : "N/A";

      res.json({
        success: true,
        data: {
          totalSolutions: total || 0,
          acceptedSolutions: accepted || 0,
          averageRating: avgRating
        }
      });
    } catch (error) {
      console.error('Get student stats error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas do estudante.' });
    }
  }

  static async getComments(req, res) {
    try {
      const { id } = req.params; // Solution ID
      const { data: comments, error } = await supabase
        .from('Comment')
        .select('*, user:User(id, name, avatar, role, companyProfile:CompanyProfile(companyName))')
        .eq('solutionId', id)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data: comments });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar comentários.' });
    }
  }

  static async createComment(req, res) {
    try {
      const { id } = req.params; // Solution ID
      const { content } = req.body;
      const userId = req.userId;

      const { data: comment, error } = await supabase
        .from('Comment')
        .insert({
          solutionId: id,
          userId,
          content,
          createdAt: new Date()
        })
        .select('*, user:User(id, name, avatar, role)')
        .single();

      if (error) throw error;

      res.status(201).json({ success: true, message: 'Comentário adicionado.', data: comment });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ success: false, message: 'Erro ao criar comentário.' });
    }
  }

  static async togglePAP(req, res) {
    try {
      const { id } = req.params;
      
      if (req.userRole !== 'SCHOOL') {
        return res.status(403).json({ success: false, message: 'Apenas escolas podem validar PAPs.' });
      }

      // Buscar estado atual
      const { data: solution } = await supabase.from('Solution').select('isPAP').eq('id', id).single();
      
      const { data: updated, error } = await supabase
        .from('Solution')
        .update({ isPAP: !solution.isPAP })
        .eq('id', id)
        .select().single();

      if (error) throw error;
      res.json({ success: true, message: updated.isPAP ? 'Marcado como PAP.' : 'Desmarcado como PAP.', data: updated });
    } catch (error) {
      console.error('Toggle PAP error:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar estado PAP.' });
    }
  }

  static async gradeSolution(req, res) {
    try {
      const { id } = req.params;
      const { schoolGrade, schoolFeedback } = req.body;

      if (req.userRole !== 'SCHOOL' && req.userRole !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Acesso negado. Apenas escolas podem avaliar avaliações oficiais.' });
      }

      const { data: solution, error } = await supabase
        .from('Solution')
        .update({ schoolGrade, schoolFeedback })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: 'Avaliação da escola guardada com sucesso.',
        data: solution
      });

    } catch (error) {
      console.error('Grade solution error:', error);
      res.status(500).json({ success: false, message: 'Erro ao guardar a avaliação da escola.' });
    }
  }

  static async exportGrades(req, res) {
    try {
      if (req.userRole !== 'SCHOOL' && req.userRole !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Acesso negado.' });
      }

      // Buscar soluções dos alunos (para a escola ligada poderia filtrar por isPAP se desejado)
      // Aqui buscamos todas as soluções com a info do problema e estudante
      let query = supabase
        .from('Solution')
        .select('*, student:StudentProfile(*, user:User(name, email)), problem:Problem(title)');

      const { data: solutions, error } = await query;

      if (error) throw error;

      // Cria um workbook e worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Avaliações Oficiais');

      // Define columns
      worksheet.columns = [
        { header: 'Aluno', key: 'studentName', width: 30 },
        { header: 'Email', key: 'studentEmail', width: 30 },
        { header: 'Projeto/Desafio', key: 'problemTitle', width: 40 },
        { header: 'Data de Submissão', key: 'submittedAt', width: 22 },
        { header: 'Estado', key: 'status', width: 20 },
        { header: 'Validado como PAP', key: 'isPAP', width: 20 },
        { header: 'Nota Escolar', key: 'schoolGrade', width: 15 },
        { header: 'Feedback Escolar', key: 'schoolFeedback', width: 50 }
      ];

      // Formatar header
      worksheet.getRow(1).font = { bold: true };
      
      // Add data
      solutions.forEach(solution => {
        worksheet.addRow({
          studentName: solution.student?.user?.name || 'N/A',
          studentEmail: solution.student?.user?.email || 'N/A',
          problemTitle: solution.problem?.title || 'N/A',
          submittedAt: new Date(solution.submittedAt).toLocaleString(),
          status: solution.status,
          isPAP: solution.isPAP ? 'Sim' : 'Não',
          schoolGrade: solution.schoolGrade || 'S/ Nota',
          schoolFeedback: solution.schoolFeedback || ''
        });
      });

      // Response headers para Excel
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + 'pauta_avaliacoes.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Export grades error:', error);
      res.status(500).json({ success: false, message: 'Erro ao exportar pauta.' });
    }
  }
}