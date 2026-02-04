import { validationResult } from 'express-validator';
import { supabase } from '../lib/supabase.js';

export class ProblemController {
  // GET /api/problems
  static async getAllProblems(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        difficulty,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Validar o campo de ordenação para evitar erros de SQL se a coluna não existir
      const validSortFields = ['createdAt', 'title', 'difficulty', 'status'];
      const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

      let query = supabase
        .from('Problem')
        // Simplificado ao máximo para garantir funcionamento. Removemos relações complexas por agora.
        .select('*', { count: 'exact' })
        .eq('status', 'ACTIVE');

      if (category) query = query.eq('category', category);
      if (difficulty) query = query.eq('difficulty', difficulty);
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`); // tags array search not simple in ilike
      }

      query = query
        .order(safeSortBy, { ascending: sortOrder === 'asc' })
        .range(skip, skip + limitNum - 1);

      const { data: problems, count: total, error } = await query;
      if (error) throw error;

      const result = {
        data: problems,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      };

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get all problems error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar desafios.' });
    }
  }

  // GET /api/problems/active
  static async getActiveProblems(req, res) {
    try {
      const { data: problems } = await supabase
        .from('Problem')
        .select('*, company:CompanyProfile(companyName, user:User(avatar)), solutions:Solution(count)')
        .eq('status', 'ACTIVE')
        // .gt('deadline', new Date().toISOString()) // Assumindo que existe coluna deadline
        .order('createdAt', { ascending: false })
        .limit(10);

      res.json({ success: true, data: problems });
    } catch (error) {
      console.error('Get active problems error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar desafios ativos.' });
    }
  }

  // GET /api/problems/featured
  static async getFeaturedProblems(req, res) {
    try {
      const { data: problems } = await supabase
        .from('Problem')
        .select('*, company:CompanyProfile(companyName, user:User(avatar))')
        .eq('status', 'ACTIVE')
        .eq('isFeatured', true)
        .limit(5);

      res.json({ success: true, data: problems });
    } catch (error) {
      console.error('Get featured problems error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar desafios em destaque.' });
    }
  }

  // GET /api/problems/:id
  static async getProblemById(req, res) {
    try {
      const { id } = req.params;
      const { data: problem } = await supabase
        .from('Problem')
        .select('*, company:CompanyProfile(companyName, industry, user:User(name, avatar)), solutions:Solution(count)')
        .eq('id', id)
        .single();

      if (!problem) {
        return res.status(404).json({ success: false, message: 'Desafio não encontrado.' });
      }

      // Opcional: Incrementar visualizações
      // supabase.rpc('increment_views', { problem_id: id }) // Se existir RPC
      // Ou update simples (menos seguro para concorrência)
      // await supabase.from('Problem').update({ views: (problem.views || 0) + 1 }).eq('id', id);

      res.json({ success: true, data: problem });
    } catch (error) {
      console.error('Get problem by id error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar o desafio.' });
    }
  }

  // POST /api/problems
  static async createProblem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const companyId = req.companyId;
      if (!companyId) {
        return res.status(403).json({ success: false, message: 'Apenas empresas podem criar desafios.' });
      }

      const problemData = {
        ...req.body,
        companyId,
        status: 'ACTIVE',
      };

      const { data: problem, error } = await supabase
        .from('Problem')
        .insert(problemData)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ success: true, message: 'Desafio criado com sucesso!', data: problem });
    } catch (error) {
      console.error('Create problem error:', error);
      res.status(500).json({ success: false, message: 'Erro ao criar o desafio.' });
    }
  }

  // PUT /api/problems/:id
  static async updateProblem(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      
      // Verificar se o problema existe e pertence à empresa
      const { data: existingProblem } = await supabase.from('Problem').select('*').eq('id', id).single();
      
      if (!existingProblem) {
        return res.status(404).json({ success: false, message: 'Desafio não encontrado.' });
      }
      
      if (req.userRole !== 'ADMIN' && existingProblem.companyId !== companyId) {
        return res.status(403).json({ success: false, message: 'Não tem permissão para editar este desafio.' });
      }

      const { data: problem, error } = await supabase
        .from('Problem')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, message: 'Desafio atualizado com sucesso!', data: problem });
    } catch (error) {
      console.error('Update problem error:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar o desafio.' });
    }
  }

  // DELETE /api/problems/:id
  static async deleteProblem(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.companyId;

      const { data: existingProblem } = await supabase.from('Problem').select('*').eq('id', id).single();
      
      if (!existingProblem) {
        return res.status(404).json({ success: false, message: 'Desafio não encontrado.' });
      }

      if (req.userRole !== 'ADMIN' && existingProblem.companyId !== companyId) {
        return res.status(403).json({ success: false, message: 'Não tem permissão para eliminar este desafio.' });
      }

      await supabase.from('Problem').delete().eq('id', id);

      res.json({ success: true, message: 'Desafio eliminado com sucesso!' });
    } catch (error) {
      console.error('Delete problem error:', error);
      res.status(500).json({ success: false, message: 'Erro ao eliminar o desafio.' });
    }
  }

  // GET /api/problems/company/:companyId
  static async getCompanyProblems(req, res) {
    try {
      // Se vier da rota /company/my usa o ID do token, senão usa o parametro da URL
      const companyId = req.path.includes('/my') ? req.companyId : req.params.companyId;

      if (!companyId) {
        return res.status(400).json({ success: false, message: 'ID da empresa não fornecido.' });
      }

      const { data: problems, error } = await supabase
        .from('Problem')
        .select('*') // Simplificado para evitar erros de relação (500)
        .eq('companyId', companyId)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data: problems || [] });
    } catch (error) {
      console.error('Get company problems error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar desafios da empresa.' });
    }
  }
}