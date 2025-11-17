const express = require('express');
const Solution = require('../models/Solution');
const Challenge = require('../models/Challenge');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Submeter solução
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'student') {
      return res.status(403).json({ message: 'Apenas estudantes podem submeter soluções' });
    }

    const solutionData = {
      ...req.body,
      student: req.user._id
    };

    const solution = new Solution(solutionData);
    await solution.save();

    // Incrementar contador de aplicações no desafio
    await Challenge.findByIdAndUpdate(
      req.body.challenge,
      { $inc: { applications: 1 } }
    );

    await solution.populate('challenge', 'title company');
    await solution.populate('student', 'name studentProfile avatar');

    res.status(201).json(solution);

  } catch (error) {
    console.error('Erro ao submeter solução:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Dados inválidos', errors });
    }
    
    res.status(500).json({ message: 'Erro ao submeter solução' });
  }
});

// Obter soluções de um desafio
router.get('/challenge/:challengeId', auth, async (req, res) => {
  try {
    const solutions = await Solution.find({ challenge: req.params.challengeId })
      .populate('student', 'name studentProfile avatar')
      .sort({ createdAt: -1 });

    res.json(solutions);

  } catch (error) {
    console.error('Erro ao obter soluções:', error);
    res.status(500).json({ message: 'Erro ao carregar soluções' });
  }
});

// Obter soluções de um estudante
router.get('/student/:studentId', async (req, res) => {
  try {
    const solutions = await Solution.find({ student: req.params.studentId })
      .populate('challenge', 'title company area reward')
      .sort({ createdAt: -1 });

    res.json(solutions);

  } catch (error) {
    console.error('Erro ao obter soluções do estudante:', error);
    res.status(500).json({ message: 'Erro ao carregar soluções' });
  }
});

// Avaliar solução (apenas empresa dona do desafio)
router.put('/:id/feedback', auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id)
      .populate('challenge');

    if (!solution) {
      return res.status(404).json({ message: 'Solução não encontrada' });
    }

    // Verificar se o utilizador é a empresa dona do desafio
    if (solution.challenge.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Não tem permissão para avaliar esta solução' });
    }

    solution.feedback = {
      companyFeedback: req.body.feedback,
      rating: req.body.rating,
      reviewedAt: new Date(),
      reviewer: req.user._id
    };

    solution.status = req.body.status || 'under_review';
    await solution.save();

    await solution.populate('student', 'name studentProfile avatar');
    await solution.populate('challenge', 'title company');

    res.json(solution);

  } catch (error) {
    console.error('Erro ao avaliar solução:', error);
    res.status(500).json({ message: 'Erro ao avaliar solução' });
  }
});

// Atualizar status da solução
router.put('/:id/status', auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id)
      .populate('challenge');

    if (!solution) {
      return res.status(404).json({ message: 'Solução não encontrada' });
    }

    // Verificar permissões
    const isCompanyOwner = solution.challenge.company.toString() === req.user._id.toString();
    const isStudentOwner = solution.student.toString() === req.user._id.toString();

    if (!isCompanyOwner && !isStudentOwner) {
      return res.status(403).json({ message: 'Não tem permissão para atualizar esta solução' });
    }

    solution.status = req.body.status;
    await solution.save();

    res.json(solution);

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ message: 'Erro ao atualizar solução' });
  }
});

// Eliminar solução
router.delete('/:id', auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({ message: 'Solução não encontrada' });
    }

    if (solution.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Não tem permissão para eliminar esta solução' });
    }

    await Solution.findByIdAndDelete(req.params.id);
    res.json({ message: 'Solução eliminada com sucesso' });

  } catch (error) {
    console.error('Erro ao eliminar solução:', error);
    res.status(500).json({ message: 'Erro ao eliminar solução' });
  }
});

module.exports = router;