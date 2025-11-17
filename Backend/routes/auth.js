const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Registar utilizador
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, profile } = req.body;

    // Validar dados
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'A palavra-passe deve ter pelo menos 6 caracteres' });
    }

    // Verificar se o utilizador já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Já existe uma conta com este email' });
    }

    // Hash da password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar utilizador
    const userData = {
      name,
      email,
      password: hashedPassword,
      userType
    };

    // Adicionar dados do perfil específicos
    if (userType === 'student' && profile) {
      userData.studentProfile = profile;
    } else if (userType === 'company' && profile) {
      userData.companyProfile = profile;
    } else if (userType === 'school' && profile) {
      userData.schoolProfile = profile;
    }

    const user = new User(userData);
    await user.save();

    // Criar token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Conta criada com sucesso!',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Erro no registo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar dados
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e palavra-passe são obrigatórios' });
    }

    // Encontrar utilizador
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Criar token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', auth, async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

// Alterar password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A nova palavra-passe deve ter pelo menos 6 caracteres' });
    }

    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Palavra-passe atual incorreta' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Palavra-passe alterada com sucesso' });

  } catch (error) {
    console.error('Erro ao alterar password:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;