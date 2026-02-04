import { supabase } from '../lib/supabase.js';

export class AuthController {
  // GET /api/auth/me
  static async getProfile(req, res) {
    try {
      // O userId é injetado pelo middleware auth0.middleware.js (função syncUser)
      const userId = req.userId;

      const { data: user, error } = await supabase
        .from('User')
        .select('*, studentProfile:StudentProfile(*), companyProfile:CompanyProfile(*)')
        .eq('id', userId)
        .single();

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

      // 1. Atualizar User
      const { data: user, error: userError } = await supabase
        .from('User')
        .update(userData)
        .eq('id', userId)
        .select('*, studentProfile:StudentProfile(*), companyProfile:CompanyProfile(*)')
        .single();

      if (userError) throw userError;

      // 2. Atualizar Perfil Específico (Supabase não faz nested update)
      if (profile) {
        let table = null;
        if (userRole === 'STUDENT') {
          table = 'StudentProfile';
        } else if (userRole === 'COMPANY') {
          table = 'CompanyProfile';
        }
        
        if (table) {
           await supabase.from(table).update(profile).eq('userId', userId);
           // Recarregar dados atualizados
           const { data: refreshedUser } = await supabase
             .from('User')
             .select('*, studentProfile:StudentProfile(*), companyProfile:CompanyProfile(*)')
             .eq('id', userId)
             .single();
           return res.json({ success: true, message: 'Perfil atualizado!', data: refreshedUser });
        }
      }

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