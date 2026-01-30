import prisma from '../lib/prisma.js';

export class AuthController {
  // GET /api/auth/me
  static async getProfile(req, res) {
    try {
      // O userId é injetado pelo middleware auth0.middleware.js (função syncUser)
      const userId = req.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          studentProfile: true,
          companyProfile: true,
        },
      });

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilizador não encontrado.' 
        });
      }

      res.json({
        success: true,
        data: user,
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar perfil.' 
      });
    }
  }

  // PUT /api/auth/me
  static async updateProfile(req, res) {
    try {
      const userId = req.userId;
      const userRole = req.userRole;
      const updateData = req.body;
      const { name, avatar, bio, profile } = updateData;

      // Dados base do utilizador
      const userData = {};
      if (name) userData.name = name;
      if (avatar) userData.avatar = avatar;
      if (bio !== undefined) userData.bio = bio;

      // Atualização aninhada do perfil específico (Prisma Nested Write)
      if (profile) {
        if (userRole === 'STUDENT') {
          userData.studentProfile = { update: profile };
        } else if (userRole === 'COMPANY') {
          userData.companyProfile = { update: profile };
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: userData,
        include: {
          studentProfile: true,
          companyProfile: true,
        },
      });

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        data: user
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar perfil.' 
      });
    }
  }
}