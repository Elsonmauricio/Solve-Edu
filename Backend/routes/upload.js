const express = require('express');
const { uploadAvatar, uploadSolutionFiles, uploadChallengeFiles, handleUploadError } = require('../middleware/upload');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Upload de avatar
router.post('/avatar', auth, uploadAvatar, handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum ficheiro enviado' });
    }

    const fileUrl = `/uploads/avatars/${req.file.filename}`;
    
    res.json({
      message: 'Avatar carregado com sucesso',
      fileUrl,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Erro no upload do avatar:', error);
    res.status(500).json({ message: 'Erro ao carregar avatar' });
  }
});

// Upload de ficheiros de solução
router.post('/solution', auth, uploadSolutionFiles, handleUploadError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Nenhum ficheiro enviado' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/solutions/${file.filename}`,
      type: file.mimetype,
      size: file.size
    }));

    res.json({
      message: 'Ficheiros carregados com sucesso',
      files
    });

  } catch (error) {
    console.error('Erro no upload de ficheiros:', error);
    res.status(500).json({ message: 'Erro ao carregar ficheiros' });
  }
});

// Upload de ficheiro de desafio
router.post('/challenge', auth, uploadChallengeFiles, handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum ficheiro enviado' });
    }

    const fileUrl = `/uploads/challenges/${req.file.filename}`;
    
    res.json({
      message: 'Ficheiro carregado com sucesso',
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname
    });

  } catch (error) {
    console.error('Erro no upload do ficheiro:', error);
    res.status(500).json({ message: 'Erro ao carregar ficheiro' });
  }
});

module.exports = router;