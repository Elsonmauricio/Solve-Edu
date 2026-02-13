import { supabase } from '../lib/supabase.js';

export class AuthController {
  // GET /api/auth/me
  static async getProfile(req, res) {
    try {
      // Usar o objeto user já carregado e corrigido pelo middleware
      // O middleware já garante que user.role está preenchido (fallback para STUDENT)
      const user = req.user;

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilizador não encontrado.' 
        });
      }

      // Preparar resposta mantendo a estrutura esperada (perfis aninhados)
      const responseUser = { ...user };
      
      // Garantir que os perfis estão anexados se não vierem do middleware
      if (user.role === 'STUDENT' && !responseUser.studentProfile) {
         const { data } = await supabase.from('StudentProfile').select('*').eq('userId', user.id).maybeSingle();
         responseUser.studentProfile = data;
      }
      if (user.role === 'COMPANY' && !responseUser.companyProfile) {
         const { data } = await supabase.from('CompanyProfile').select('*').eq('userId', user.id).maybeSingle();
         responseUser.companyProfile = data;
      }
      if (user.role === 'SCHOOL' && !responseUser.schoolProfile) {
         const { data } = await supabase.from('SchoolProfile').select('*').eq('userId', user.id).maybeSingle();
         responseUser.schoolProfile = data;
      }

      res.json({
        success: true,
        data: responseUser,
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
        .select('*, studentProfile:StudentProfile(*), companyProfile:CompanyProfile(*), schoolProfile:SchoolProfile(*)')
        .single();

      if (userError) throw userError;

      // 2. Atualizar Perfil Específico (Supabase não faz nested update)
      if (profile) {
        let table = null;
        if (userRole === 'STUDENT') {
          table = 'StudentProfile';
        } else if (userRole === 'COMPANY') {
          table = 'CompanyProfile';
        } else if (userRole === 'SCHOOL') {
          table = 'SchoolProfile';
        }
        
        if (table) {
           await supabase.from(table).update(profile).eq('userId', userId);
           // Recarregar dados atualizados
           const { data: refreshedUser } = await supabase
             .from('User')
             .select('*, studentProfile:StudentProfile(*), companyProfile:CompanyProfile(*), schoolProfile:SchoolProfile(*)')
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