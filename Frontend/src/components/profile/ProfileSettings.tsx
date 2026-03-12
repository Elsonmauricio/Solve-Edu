import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import { Save, User, Building, School, Link as LinkIcon, Briefcase, GraduationCap, MapPin, Mail, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { SCHOOLS, INDUSTRIES } from '../../utils/constants';

const ProfileSettings: React.FC = () => {
  const { user, dispatch } = useApp();
  const { getAccessTokenSilently } = useAuth0();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    profile: {} as any,
  });

  useEffect(() => {
    if (user) {
      let initialProfile = {};
      
      if (user.role === 'STUDENT' && user.studentProfile) {
        initialProfile = { ...user.studentProfile };
      } else if (user.role === 'COMPANY' && user.companyProfile) {
        initialProfile = { ...user.companyProfile };
      } else if (user.role === 'SCHOOL' && user.schoolProfile) {
        initialProfile = { ...user.schoolProfile };
      }

      setFormData({
        name: user.name || '',
        avatar: user.avatar || '',
        profile: initialProfile,
      });
    }
  }, [user]);

  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      profile: { ...formData.profile, [e.target.name]: e.target.value },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently();
      const response = await api.put('/users/me', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Atualizar estado com response (que já tem o user nesto formato pelo menos com name/avatar atualizados)
        // Para atualizar o context sem F5, seria ideal o backend devolver o objeto user inteiro povoado com perfis
        toast.success('Perfil atualizado com sucesso!');
        setTimeout(() => {
           window.location.reload(); // Quick refresh to update context globally if needed
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-100 bg-gray-50 flex items-center space-x-4">
           {user.role === 'STUDENT' && <User className="w-8 h-8 text-solve-blue" />}
           {user.role === 'COMPANY' && <Building className="w-8 h-8 text-solve-blue" />}
           {user.role === 'SCHOOL' && <School className="w-8 h-8 text-solve-blue" />}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações de Perfil</h1>
            <p className="text-sm text-gray-500 mt-1">
              Complete os seus dados para uma melhor experiência na plataforma.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Informação Base - Comum a todos */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-400" />
              Informações Básicas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleBaseChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Foto de Perfil / Avatar</label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleBaseChange}
                  placeholder="https://exemplo.com/minha-foto.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Campos Específicos por Role */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detalhes de {user.role === 'STUDENT' ? 'Professor/Estudante' : user.role === 'COMPANY' ? 'Empresa' : 'Instituição de Ensino'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* STUDENT FIELDS */}
              {user.role === 'STUDENT' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><School className="w-4 h-4 mr-1 text-gray-400"/>Escola</label>
                    <input
                      type="text"
                      name="school"
                      list="school-suggestions"
                      value={formData.profile.school || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent bg-white"
                      placeholder="Ex: Universidade do Porto"
                    />
                    <datalist id="school-suggestions">
                      {SCHOOLS.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><GraduationCap className="w-4 h-4 mr-1 text-gray-400"/>Curso / Área</label>
                    <input type="text" name="course" value={formData.profile.course || ''} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><LinkIcon className="w-4 h-4 mr-1 text-gray-400"/>GitHub URL</label>
                    <input type="url" name="githubUrl" value={formData.profile.githubUrl || ''} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Briefcase className="w-4 h-4 mr-1 text-gray-400"/>Portefólio URL</label>
                    <input type="url" name="portfolioUrl" value={formData.profile.portfolioUrl || ''} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biografia Curta</label>
                    <textarea name="bio" value={formData.profile.bio || ''} onChange={handleProfileChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent" />
                  </div>
                </>
              )}

              {/* COMPANY FIELDS */}
              {user.role === 'COMPANY' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Building className="w-4 h-4 mr-1 text-gray-400"/>Nome da Empresa</label>
                    <input type="text" name="companyName" value={formData.profile.companyName || ''} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Briefcase className="w-4 h-4 mr-1 text-gray-400"/>Indústria / Setor</label>
                    <input
                      type="text"
                      name="industry"
                      list="industry-suggestions"
                      value={formData.profile.industry || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent bg-white"
                      placeholder="Ex: Tecnologia, Saúde..."
                    />
                    <datalist id="industry-suggestions">
                      {INDUSTRIES.map(i => <option key={i} value={i} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><LinkIcon className="w-4 h-4 mr-1 text-gray-400"/>Website (URL)</label>
                    <input type="url" name="website" value={formData.profile.website || ''} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea name="description" value={formData.profile.description || ''} onChange={handleProfileChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent" />
                  </div>
                </>
              )}

              {/* SCHOOL FIELDS */}
              {user.role === 'SCHOOL' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><School className="w-4 h-4 mr-1 text-gray-400"/>Nome da Instituição</label>
                    <input type="text" name="schoolName" value={formData.profile.schoolName || ''} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400"/>Endereço</label>
                    <input type="text" name="address" value={formData.profile.address || ''} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Mail className="w-4 h-4 mr-1 text-gray-400"/>Email de Contacto</label>
                    <input type="email" name="contactEmail" value={formData.profile.contactEmail || ''} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Phone className="w-4 h-4 mr-1 text-gray-400"/>Número de Telefone</label>
                    <input type="text" name="phoneNumber" value={formData.profile.phoneNumber || ''} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solve-blue focus:border-transparent" />
                  </div>
                </>
              )}
            </div>
          </section>

          <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-solve-blue text-white rounded-lg hover:bg-solve-purple transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
