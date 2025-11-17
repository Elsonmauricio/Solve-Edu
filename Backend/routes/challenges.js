const express = require('express');
const Challenge = require('../models/Challenge');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Obter todos os desafios (com filtros)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      area, 
      difficulty, 
      rewardType, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filter = { status: 'active' };
    let sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Aplicar filtros
    if (area) filter.area = area;
    if (difficulty) filter.difficulty = difficulty;
    if (rewardType) filter['reward.type'] = rewardType;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const challenges = await Challenge.find(filter)
      .populate('company', 'name companyProfile avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Challenge.countDocuments(filter);

    res.json({
      challenges,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Erro ao obter desafios:', error);
    res.status(500).json({ message: 'Erro ao carregar desafios' });
  }
});

// Obter desafio específico
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('company', 'name companyProfile avatar');

    if (!challenge) {
      return res.status(404).json({ message: 'Desafio não encontrado' });
    }

    // Incrementar visualizações
    challenge.views += 1;
    await challenge.save();

    res.json(challenge);

  } catch (error) {
    console.error('Erro ao obter desafio:', error);
    res.status(500).json({ message: 'Erro ao carregar desafio' });
  }
});

// Criar novo desafio (apenas empresas)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'company') {
      return res.status(403).json({ message: 'Apenas empresas podem criar desafios' });
    }

    const challengeData = {
      ...req.body,
      company: req.user._id
    };

    const challenge = new Challenge(challengeData);
    await challenge.save();
    
    await challenge.populate('company', 'name companyProfile avatar');

    res.status(201).json(challenge);

  } catch (error) {
    console.error('Erro ao criar desafio:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Dados inválidos', errors });
    }
    
    res.status(500).json({ message: 'Erro ao criar desafio' });
  }
});

// Atualizar desafio
router.put('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Desafio não encontrado' });
    }

    if (challenge.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Não tem permissão para editar este desafio' });
    }

    Object.assign(challenge, req.body);
    await challenge.save();

    await challenge.populate('company', 'name companyProfile avatar');
    res.json(challenge);

  } catch (error) {
    console.error('Erro ao atualizar desafio:', error);
    res.status(500).json({ message: 'Erro ao atualizar desafio' });
  }
});

// Eliminar desafio
router.delete('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Desafio não encontrado' });
    }

    if (challenge.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Não tem permissão para eliminar este desafio' });
    }

    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ message: 'Desafio eliminado com sucesso' });

  } catch (error) {
    console.error('Erro ao eliminar desafio:', error);
    res.status(500).json({ message: 'Erro ao eliminar desafio' });
  }
});

// Obter desafios de uma empresa
router.get('/company/:companyId', async (req, res) => {
  try {
    const challenges = await Challenge.find({ 
      company: req.params.companyId,
      status: { $ne: 'draft' }
    })
    .populate('company', 'name companyProfile avatar')
    .sort({ createdAt: -1 });

    res.json(challenges);

  } catch (error) {
    console.error('Erro ao obter desafios da empresa:', error);
    res.status(500).json({ message: 'Erro ao carregar desafios' });
  }
});

module.exports = router;