import { validationResult } from 'express-validator';
import { ProblemModel } from '../models/Problem.model.js';

export class ProblemController {
  static async createProblem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const companyId = req.companyId || req.body.companyId;
      
      if (!companyId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID da empresa é obrigatório.' 
        });
      }

      const problemData = {
        ...req.body,
        companyId,
      };

      const problem = await ProblemModel.create(problemData);

      res.status(201).json({
        success: true,
        message: 'Desafio criado com sucesso!',
        data: problem,
      });

    } catch (error) {
      console.error('Create problem error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar desafio.' 
      });
    }
  }

  static async getProblems(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        difficulty,
        status = 'ACTIVE',
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters = {
        category,
        difficulty,
        status,
        search,
      };

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      };

      const result = await ProblemModel.findAll(filters, pagination);

      res.json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Get problems error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar desafios.' 
      });
    }
  }

  static async getProblem(req, res) {
    try {
      const { id } = req.params;

      const problem = await ProblemModel.findById(id);
      if (!problem) {
        return res.status(404).json({ 
          success: false, 
          message: 'Desafio não encontrado.' 
        });
      }

      // Increment views
      await ProblemModel.incrementViews(id);

      res.json({
        success: true,
        data: problem,
      });

    } catch (error) {
      console.error('Get problem error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar desafio.' 
      });
    }
  }

  static async updateProblem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updateData = req.body;

      // Check if problem exists and belongs to company
      const existingProblem = await ProblemModel.findById(id);
      if (!existingProblem) {
        return res.status(404).json({ 
          success: false, 
          message: 'Desafio não encontrado.' 
        });
      }

      // Check authorization
      if (req.userRole !== 'ADMIN' && existingProblem.companyId !== req.companyId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Não tem permissão para atualizar este desafio.' 
        });
      }

      const problem = await ProblemModel.update(id, updateData);

      res.json({
        success: true,
        message: 'Desafio atualizado com sucesso!',
        data: problem,
      });

    } catch (error) {
      console.error('Update problem error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar desafio.' 
      });
    }
  }

  static async deleteProblem(req, res) {
    try {
      const { id } = req.params;

      // Check if problem exists
      const existingProblem = await ProblemModel.findById(id);
      if (!existingProblem) {
        return res.status(404).json({ 
          success: false, 
          message: 'Desafio não encontrado.' 
        });
      }

      // Check authorization
      if (req.userRole !== 'ADMIN' && existingProblem.companyId !== req.companyId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Não tem permissão para eliminar este desafio.' 
        });
      }

      await ProblemModel.delete(id);

      res.json({
        success: true,
        message: 'Desafio eliminado com sucesso!',
      });

    } catch (error) {
      console.error('Delete problem error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao eliminar desafio.' 
      });
    }
  }

  static async getCompanyProblems(req, res) {
    try {
      const companyId = req.companyId || req.params.companyId;

      const problems = await ProblemModel.findByCompany(companyId);

      res.json({
        success: true,
        data: problems,
      });

    } catch (error) {
      console.error('Get company problems error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar desafios da empresa.' 
      });
    }
  }

  static async getActiveProblems(req, res) {
    try {
      const problems = await ProblemModel.getActiveProblems();

      res.json({
        success: true,
        data: problems,
      });

    } catch (error) {
      console.error('Get active problems error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar desafios ativos.' 
      });
    }
  }

  static async getFeaturedProblems(req, res) {
    try {
      const problems = await ProblemModel.getFeaturedProblems();

      res.json({
        success: true,
        data: problems,
      });

    } catch (error) {
      console.error('Get featured problems error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar desafios em destaque.' 
      });
    }
  }
}