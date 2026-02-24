import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Shield, Bell, Globe, Mail, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import MoonLoader from '../common/MoonLoader';

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    platformName: 'SolveEdu',
    supportEmail: 'support@solveedu.pt',
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    autoBackup: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getSettings();
        if (response.success) {
          setSettings(response.data);
        }
      } catch (error) {
        toast.error('Não foi possível carregar as definições.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    const toastId = toast.loading('A guardar...');
    try {
      const response = await adminService.updateSettings(settings);
      if (response.success) {
        toast.success('Definições guardadas com sucesso!', { id: toastId });
      }
    } catch (error) {
      toast.error('Erro ao guardar as definições.', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Definições da Plataforma</h1>
            <p className="text-gray-600 mt-1">Gerencie as configurações globais do sistema</p>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 bg-solve-blue text-white rounded-xl hover:bg-solve-purple transition-colors font-medium shadow-lg shadow-blue-200"
          >
            <Save size={20} />
            <span>Guardar Alterações</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-20">
            <MoonLoader />
          </div>
        ) : (
        <div className="space-y-6">
          {/* General Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            {...({ className: "bg-white p-6 rounded-2xl shadow-sm border border-gray-200"} as any)}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Geral</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Plataforma</label>
                <input 
                  type="text" 
                  name="platformName"
                  value={settings.platformName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email de Suporte</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    name="supportEmail"
                    value={settings.supportEmail}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* System & Security */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            {...({ className: "bg-white p-6 rounded-2xl shadow-sm border border-gray-200"} as any)}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Sistema e Segurança</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-900">Modo de Manutenção</h3>
                  <p className="text-sm text-gray-500">Impede o acesso de utilizadores não-admin</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solve-blue"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-900">Permitir Novos Registos</h3>
                  <p className="text-sm text-gray-500">Aceitar novos utilizadores na plataforma</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="allowRegistrations"
                    checked={settings.allowRegistrations}
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solve-blue"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Notifications & Backup */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            {...({ className: "bg-white p-6 rounded-2xl shadow-sm border border-gray-200"} as any)}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Dados e Notificações</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Bell className="text-gray-400" size={20} />
                  <div>
                    <h3 className="font-medium text-gray-900">Notificações por Email</h3>
                    <p className="text-sm text-gray-500">Enviar emails automáticos do sistema</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solve-blue"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Database className="text-gray-400" size={20} />
                  <div>
                    <h3 className="font-medium text-gray-900">Backups Automáticos</h3>
                    <p className="text-sm text-gray-500">Realizar backup diário da base de dados</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="autoBackup"
                    checked={settings.autoBackup}
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solve-blue"></div>
                </label>
              </div>
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;