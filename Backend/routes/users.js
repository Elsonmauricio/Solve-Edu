const express = require('express');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Solution = require('../models/Solution');
const { auth } = require('../middleware/auth');
const { httpStatus, errorMessages } = require('../utils/constants');

const router = express.Router();

// Obter perfil do utilizador
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: errorMessages.INTERNAL_SERVER_ERROR });
  }
});

// Atualizar perfil do utilizador
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Atualizar campos básicos
    if (req.body.name) user.name = req.body.name;
    if (req.body.avatar) user.avatar = req.body.avatar;

    // Atualizar perfil específico
    if (user.userType === 'student' && req.body.studentProfile) {
      user.studentProfile = { ...user.studentProfile, ...req.body.studentProfile };
    } else if (user.userType === 'company' && req.body.companyProfile) {
      user.companyProfile = { ...user.companyProfile, ...req.body.companyProfile };
    } else if (user.userType === 'school' && req.body.schoolProfile) {
      user.schoolProfile = { ...user.schoolProfile, ...req.body.schoolProfile };
    }

    await user.save();
    res.json(user);

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: errorMessages.INTERNAL_SERVER_ERROR });
  }
});

// Obter perfil público
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email');

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: errorMessages.NOT_FOUND });
    }

    res.json(user);

  } catch (error) {
    console.error('Erro ao obter perfil público:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: errorMessages.INTERNAL_SERVER_ERROR });
  }
});

// Obter estatísticas do utilizador
router.get('/:id/stats', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: errorMessages.NOT_FOUND });
    }

    let stats = {};

    if (user.userType === 'company') {
      const challengesCount = await Challenge.countDocuments({ company: userId });
      const activeChallenges = await Challenge.countDocuments({ 
        company: userId, 
        status: 'active' 
      });
      const solutionsCount = await Solution.countDocuments({
        challenge: { $in: await Challenge.find({ company: userId }).select('_id') }
      });

      stats = {
        challengesCount,
        activeChallenges,
        solutionsCount,
        completionRate: challengesCount > 0 ? Math.round((activeChallenges / challengesCount) * 100) : 0
      };

    } else if (user.userType === 'student') {
      const solutionsCount = await Solution.countDocuments({ student: userId });
      const approvedSolutions = await Solution.countDocuments({ 
        student: userId, 
        status: 'approved' 
      });
      const pendingSolutions = await Solution.countDocuments({ 
        student: userId, 
        status: { $in: ['submitted', 'under_review'] } 
      });

      stats = {
        solutionsCount,
        approvedSolutions,
        pendingSolutions,
        successRate: solutionsCount > 0 ? Math.round((approvedSolutions / solutionsCount) * 100) : 0
      };
    }

    res.json(stats);

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: errorMessages.INTERNAL_SERVER_ERROR });
  }
});

// Pesquisar utilizadores
router.get('/', async (req, res) => {
  try {
    const { search, userType, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (userType) filter.userType = userType;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'companyProfile.companyName': { $regex: search, $options: 'i' } },
        { 'studentProfile.school': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Erro ao pesquisar utilizadores:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: errorMessages.INTERNAL_SERVER_ERROR });
  }
});

module.exports = router;