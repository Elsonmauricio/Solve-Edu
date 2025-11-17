const express = require('express');
const Challenge = require('../models/Challenge');
const Solution = require('../models/Solution');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Analytics gerais da plataforma (apenas admin)
router.get('/platform', auth, async (req, res) => {
  try {
    // Verificar se é admin (podes adicionar role de admin depois)
    if (req.user.userType !== 'company') {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ userType: 'student' });
    const totalCompanies = await User.countDocuments({ userType: 'company' });
    const totalChallenges = await Challenge.countDocuments();
    const totalSolutions = await Solution.countDocuments();
    const activeChallenges = await Challenge.countDocuments({ status: 'active' });

    // Estatísticas por área
    const challengesByArea = await Challenge.aggregate([
      {
        $group: {
          _id: '$area',
          count: { $sum: 1 }
        }
      }
    ]);

    // Soluções por status
    const solutionsByStatus = await Solution.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totals: {
        users: totalUsers,
        students: totalStudents,
        companies: totalCompanies,
        challenges: totalChallenges,
        solutions: totalSolutions,
        activeChallenges
      },
      challengesByArea,
      solutionsByStatus
    });

  } catch (error) {
    console.error('Erro ao obter analytics:', error);
    res.status(500).json({ message: 'Erro ao carregar analytics' });
  }
});

// Analytics da empresa
router.get('/company', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'company') {
      return res.status(403).json({ message: 'Apenas empresas podem aceder a estas analytics' });
    }

    const companyId = req.user._id;

    // Desafios da empresa
    const challenges = await Challenge.find({ company: companyId });
    const totalChallenges = challenges.length;
    const activeChallenges = challenges.filter(c => c.status === 'active').length;

    // Soluções para os desafios da empresa
    const solutions = await Solution.find({
      challenge: { $in: challenges.map(c => c._id) }
    }).populate('student', 'name studentProfile');

    const totalSolutions = solutions.length;
    const approvedSolutions = solutions.filter(s => s.status === 'approved').length;
    const pendingSolutions = solutions.filter(s => 
      ['submitted', 'under_review'].includes(s.status)
    ).length;

    // Desafios mais populares
    const popularChallenges = await Challenge.find({ company: companyId })
      .sort({ views: -1 })
      .limit(5)
      .select('title views applications');

    // Estatísticas mensais
    const monthlyStats = await Challenge.aggregate([
      {
        $match: { 
          company: companyId,
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          challenges: { $sum: 1 },
          views: { $sum: '$views' },
          applications: { $sum: '$applications' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      overview: {
        totalChallenges,
        activeChallenges,
        totalSolutions,
        approvedSolutions,
        pendingSolutions,
        successRate: totalSolutions > 0 ? Math.round((approvedSolutions / totalSolutions) * 100) : 0
      },
      popularChallenges,
      monthlyStats
    });

  } catch (error) {
    console.error('Erro ao obter analytics da empresa:', error);
    res.status(500).json({ message: 'Erro ao carregar analytics' });
  }
});

module.exports = router;