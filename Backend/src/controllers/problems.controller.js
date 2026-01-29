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
}