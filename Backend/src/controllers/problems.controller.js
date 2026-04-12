import { validationResult } from 'express-validator';
import { supabase } from '../lib/supabase.js';
import { storageService } from '../services/storage.service.js';
import { sanitizeRichText } from '../utils/sanitizer.js';
import asyncHandler from '../utils/asyncHandler.js';

export class ProblemController {
  // GET /api/problems
  static getAllProblems = asyncHandler(async (req, res) => {
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
  });

  // GET /api/problems/active
  static getActiveProblems = asyncHandler(async (req, res) => {
      const { data: problems } = await supabase
        .from('Problem')
        .select('*, company:CompanyProfile(companyName, user:User(avatar)), solutions:Solution(count)')
        .eq('status', 'ACTIVE')
        // .gt('deadline', new Date().toISOString()) // Assumindo que existe coluna deadline
        .order('createdAt', { ascending: false })
        .limit(10);

      res.json({ success: true, data: problems });
  });

  // GET /api/problems/featured
  static getFeaturedProblems = asyncHandler(async (req, res) => {
      const { data: problems } = await supabase
        .from('Problem')
        .select('*, company:CompanyProfile(companyName, user:User(avatar))')
        .eq('status', 'ACTIVE')
        .eq('isFeatured', true)
        .limit(5);

      res.json({ success: true, data: problems });
  });

  // GET /api/problems/:id
  static getProblemById = asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { data: problem } = await supabase
        .from('Problem')
        .select('*, company:CompanyProfile(companyName, industry, user:User(name, avatar)), solutions:Solution(count)')
        .eq('id', id)
        .single();

      if (!problem) {
        return res.status(404).json({ success: false, message: 'Desafio não encontrado.' });
      }

      res.json({ success: true, data: problem });
  });

  // POST /api/problems
  static createProblem = asyncHandler(async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Erro de validação ao criar problema:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const companyId = req.companyId;
      if (!companyId) {
        return res.status(403).json({ success: false, message: 'Apenas empresas podem criar desafios.' });
      }

      // Upload do ficheiro para o Supabase (se existir)
      let fileUrls = [];
      if (req.file) {
        try {
          const url = await storageService.uploadFile(req.file, 'problems');
          if (url) fileUrls.push(url);
        } catch (uploadError) {
          console.error('Erro no upload do ficheiro:', uploadError);
          return res.status(500).json({ success: false, message: 'Erro ao fazer upload do documento.', error: uploadError.message });
        }
      }

      // Construção explícita do objeto para evitar erros de campos inexistentes no DB
      const problemData = {
        title: req.body.title,
        description: sanitizeRichText(req.body.description),
        category: req.body.category,
        difficulty: req.body.difficulty,
        deadline: req.body.deadline,
        companyId,
        status: 'ACTIVE',
        tags: Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags ? [req.body.tags] : []),
        requirements: Array.isArray(req.body.requirements) ? req.body.requirements : (req.body.requirements ? [req.body.requirements] : []),
      };

      // Adicionar campos opcionais apenas se existirem (evita erro se coluna não existir no DB)
      if (req.body.reward) problemData.reward = req.body.reward;
      if (fileUrls.length > 0) problemData.files = fileUrls;

      console.log('Tentando criar problema com dados:', problemData);

      const { data: problem, error } = await supabase
        .from('Problem')
        .insert(problemData)
        .select()
        .single();

      if (error) {
        console.error('Erro Supabase ao inserir problema:', error);
        throw error;
      }

      // Notificar o frontend (Admin Dashboard) em tempo real sobre a nova métrica
      await supabase.channel('platform-metrics').send({
        type: 'broadcast',
        event: 'metrics-update',
        payload: { trigger: 'new_problem', problemId: problem.id }
      });

      res.status(201).json({ success: true, message: 'Desafio criado com sucesso!', data: problem });
  });

  // PUT /api/problems/:id
  static updateProblem = asyncHandler(async (req, res) => {
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

      const updateData = { ...req.body };
      if (updateData.description) {
        updateData.description = sanitizeRichText(updateData.description);
      }

      const { data: problem, error } = await supabase
        .from('Problem')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, message: 'Desafio atualizado com sucesso!', data: problem });
  });

  // DELETE /api/problems/:id
  static deleteProblem = asyncHandler(async (req, res) => {
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
  });

  // GET /api/problems/company/:companyId
  static getCompanyProblems = asyncHandler(async (req, res) => {
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
  });
}