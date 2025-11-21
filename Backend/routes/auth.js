const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { httpStatus, errorMessages, successMessages } = require('../utils/constants');

const router = express.Router();

// Registar utilizador
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, profile } = req.body;

    // Validar dados
    if (!name || !email || !password || !userType) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: errorMessages.ALL_FIELDS_REQUIRED });
    }

    if (password.length < 6) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: errorMessages.PASSWORD_TOO_SHORT });
    }

    // Verificar se o utilizador já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: errorMessages.EMAIL_IN_USE });
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

    res.status(httpStatus.CREATED).json({
      message: successMessages.ACCOUNT_CREATED,
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Erro no registo:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: errorMessages.INTERNAL_SERVER_ERROR });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar dados
    if (!email || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: errorMessages.ALL_FIELDS_REQUIRED });
    }

    // Encontrar utilizador
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: errorMessages.INVALID_CREDENTIALS });
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: errorMessages.INVALID_CREDENTIALS });
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
      message: successMessages.LOGIN_SUCCESS,
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: errorMessages.INTERNAL_SERVER_ERROR });
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
      return res.status(httpStatus.BAD_REQUEST).json({ message: errorMessages.ALL_FIELDS_REQUIRED });
    }

    if (newPassword.length < 6) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: errorMessages.PASSWORD_TOO_SHORT });
    }

    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Palavra-passe atual incorreta' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: successMessages.PASSWORD_CHANGED });

  } catch (error) {
    console.error('Erro ao alterar password:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: errorMessages.INTERNAL_SERVER_ERROR });
  }
});

module.exports = router;