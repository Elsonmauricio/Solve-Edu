import { validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';

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

      const where = {
        status: 'ACTIVE', // Apenas desafios ativos por defeito
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
          ],
        }),
      };

      const [problems, total] = await Promise.all([
        prisma.problem.findMany({
          where,
          include: {
            company: {
              select: {
                companyName: true,
                user: { select: { avatar: true } },
              },
            },
            _count: {
              select: { solutions: true },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limitNum,
        }),
        prisma.problem.count({ where }),
      ]);

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
      const problems = await prisma.problem.findMany({
        where: {
          status: 'ACTIVE',
          deadline: { gt: new Date() }
        },
        include: {
          company: { select: { companyName: true, user: { select: { avatar: true } } } },
          _count: { select: { solutions: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      res.json({ success: true, data: problems });
    } catch (error) {
      console.error('Get active problems error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar desafios ativos.' });
    }
  }

  // GET /api/problems/featured
  static async getFeaturedProblems(req, res) {
    try {
      const problems = await prisma.problem.findMany({
        where: { status: 'ACTIVE', isFeatured: true },
        include: {
          company: { select: { companyName: true, user: { select: { avatar: true } } } }
        },
        take: 5
      });
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
      const problem = await prisma.problem.findUnique({
        where: { id },
        include: {
          company: {
            select: {
              companyName: true,
              industry: true,
              user: { select: { name: true, avatar: true } },
            },
          },
          _count: {
            select: { solutions: true },
          },
        },
      });

      if (!problem) {
        return res.status(404).json({ success: false, message: 'Desafio não encontrado.' });
      }

      // Opcional: Incrementar visualizações
      await prisma.problem.update({
        where: { id },
        data: { views: { increment: 1 } },
      });

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

      const problem = await prisma.problem.create({
        data: problemData,
      });

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
      const existingProblem = await prisma.problem.findUnique({ where: { id } });
      
      if (!existingProblem) {
        return res.status(404).json({ success: false, message: 'Desafio não encontrado.' });
      }
      
      if (req.userRole !== 'ADMIN' && existingProblem.companyId !== companyId) {
        return res.status(403).json({ success: false, message: 'Não tem permissão para editar este desafio.' });
      }

      const problem = await prisma.problem.update({
        where: { id },
        data: req.body
      });

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

      const existingProblem = await prisma.problem.findUnique({ where: { id } });
      
      if (!existingProblem) {
        return res.status(404).json({ success: false, message: 'Desafio não encontrado.' });
      }

      if (req.userRole !== 'ADMIN' && existingProblem.companyId !== companyId) {
        return res.status(403).json({ success: false, message: 'Não tem permissão para eliminar este desafio.' });
      }

      await prisma.problem.delete({ where: { id } });

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

      const problems = await prisma.problem.findMany({
        where: { companyId },
        include: {
          _count: { select: { solutions: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: problems });
    } catch (error) {
      console.error('Get company problems error:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar desafios da empresa.' });
    }
  }
}