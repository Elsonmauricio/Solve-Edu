import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { UserModel, StudentProfileModel, CompanyProfileModel } from '../models/User.model.js';

export class AuthController {
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, role, profileData } = req.body;

      // Check if user exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Este email já está registado.' 
        });
      }

      // Create user
      const user = await UserModel.create({
        email,
        password,
        name,
        role: role.toUpperCase(),
      });

      // Create profile based on role
      if (role === 'student') {
        await StudentProfileModel.create(user.id, profileData);
      } else if (role === 'company') {
        await CompanyProfileModel.create(user.id, profileData);
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(201).json({
        success: true,
        message: 'Registo realizado com sucesso!',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
          },
          token,
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro no servidor.' 
      });
    }
  }

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Credenciais inválidas.' 
        });
      }

      // Check password
      const isValidPassword = await UserModel.comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Credenciais inválidas.' 
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ 
          success: false, 
          message: 'A sua conta foi desativada.' 
        });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      // Get profile data
      let profile = null;
      if (user.role === 'STUDENT') {
        profile = await StudentProfileModel.findByUserId(user.id);
      } else if (user.role === 'COMPANY') {
        profile = await CompanyProfileModel.findByUserId(user.id);
      }

      res.json({
        success: true,
        message: 'Login realizado com sucesso!',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
            level: user.level,
          },
          profile,
          token,
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro no servidor.' 
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.userId;

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilizador não encontrado.' 
        });
      }

      // Get profile based on role
      let profile = null;
      if (user.role === 'STUDENT') {
        profile = await StudentProfileModel.findByUserId(user.id);
      } else if (user.role === 'COMPANY') {
        profile = await CompanyProfileModel.findByUserId(user.id);
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
            level: user.level,
            createdAt: user.createdAt,
          },
          profile,
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro no servidor.' 
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.userId;
      const updateData = req.body;

      // Remove sensitive fields
      delete updateData.password;
      delete updateData.email;
      delete updateData.role;

      const user = await UserModel.update(userId, updateData);

      // Update profile based on role
      if (updateData.profile) {
        if (req.userRole === 'STUDENT') {
          await StudentProfileModel.update(userId, updateData.profile);
        } else if (req.userRole === 'COMPANY') {
          await CompanyProfileModel.update(userId, updateData.profile);
        }
      }

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        data: { user }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro no servidor.' 
      });
    }
  }
}