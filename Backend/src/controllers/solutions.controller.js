import { validationResult } from 'express-validator';
import { SolutionModel } from '../models/Solution.model.js';
import { ProblemModel } from '../models/Problem.model.js';
import { NotificationModel } from '../models/Notification.model.js';

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
      const problem = await ProblemModel.findById(problemId);
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
      const existingSolution = await prisma.solution.findFirst({
        where: {
          problemId,
          studentId,
        },
      });

      if (existingSolution && existingSolution.status !== 'REJECTED') {
        return res.status(400).json({ 
          success: false, 
          message: 'Já submeteu uma solução para este desafio.' 
        });
      }

      // Create solution
      const solutionData = {
        ...req.body,
        studentId,
        status: 'PENDING_REVIEW',
        submittedAt: new Date(),
      };

      const solution = await SolutionModel.create(solutionData);

      // Create notification for company
      await NotificationModel.create({
        userId: problem.company.user.id,
        type: 'SOLUTION_SUBMITTED',
        title: 'Nova Solução Submetida',
        message: `Uma nova solução foi submetida para o seu desafio "${problem.title}"`,
        data: {
          problemId: problem.id,
          solutionId: solution.id,
          studentName: req.userName,
        },
      });

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

      const filters = {
        problemId,
        studentId,
        status,
        search,
      };

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      };

      const result = await SolutionModel.findAll(filters, pagination);

      res.json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Get solutions error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar soluções.' 
      });
    }
  }

  static async getSolution(req, res) {
    try {
      const { id } = req.params;

      const solution = await SolutionModel.findById(id);
      if (!solution) {
        return res.status(404).json({ 
          success: false, 
          message: 'Solução não encontrada.' 
        });
      }

      // Check authorization
      const canView = 
        req.userRole === 'ADMIN' ||
        solution.student.user.id === req.userId ||
        solution.problem.company.user.id === req.userId;

      if (!canView) {
        return res.status(403).json({ 
          success: false, 
          message: 'Não tem permissão para ver esta solução.' 
        });
      }

      // Increment views
      await SolutionModel.incrementViews(id);

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
      const existingSolution = await SolutionModel.findById(id);
      if (!existingSolution) {
        return res.status(404).json({ 
          success: false, 
          message: 'Solução não encontrada.' 
        });
      }

      // Check authorization
      const canUpdate = 
        req.userRole === 'ADMIN' ||
        existingSolution.student.user.id === req.userId;

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

      const solution = await SolutionModel.update(id, updateData);

      // Create notification if status changed by company/admin
      if (req.userRole !== 'STUDENT' && updateData.status && updateData.status !== existingSolution.status) {
        await NotificationModel.create({
          userId: solution.student.user.id,
          type: 'SOLUTION_REVIEWED',
          title: 'Solução Avaliada',
          message: `A sua solução para "${solution.problem.title}" foi ${updateData.status.toLowerCase()}`,
          data: {
            problemId: solution.problem.id,
            solutionId: solution.id,
            status: updateData.status,
            feedback: updateData.feedback,
          },
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
      const existingSolution = await SolutionModel.findById(id);
      if (!existingSolution) {
        return res.status(404).json({ 
          success: false, 
          message: 'Solução não encontrada.' 
        });
      }

      // Check authorization
      const canDelete = 
        req.userRole === 'ADMIN' ||
        existingSolution.student.user.id === req.userId;

      if (!canDelete) {
        return res.status(403).json({ 
          success: false, 
          message: 'Não tem permissão para eliminar esta solução.' 
        });
      }

      await SolutionModel.delete(id);

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

      const solutions = await SolutionModel.findByStudent(studentId);

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
      const problem = await ProblemModel.findById(problemId);
      if (!problem) {
        return res.status(404).json({ 
          success: false, 
          message: 'Desafio não encontrado.' 
        });
      }

      const canView = 
        req.userRole === 'ADMIN' ||
        problem.company.user.id === req.userId;

      if (!canView) {
        return res.status(403).json({ 
          success: false, 
          message: 'Não tem permissão para ver as soluções deste desafio.' 
        });
      }

      const solutions = await SolutionModel.findByProblem(problemId);

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

      const solution = await SolutionModel.findById(id);
      if (!solution) {
        return res.status(404).json({ 
          success: false, 
          message: 'Solução não encontrada.' 
        });
      }

      await SolutionModel.incrementLikes(id);

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
      const solutions = await SolutionModel.getTopSolutions();

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
      const stats = await SolutionModel.getStats();

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