import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/admin.service';
import { ShieldCheck, AlertTriangle, User, Clock } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  actor: string; // User email or 'System'
  action: string;
  details: string;
}

const LogIcon = ({ level }: { level: LogEntry['level'] }) => {
  switch (level) {
    case 'INFO':
      return <ShieldCheck className="w-5 h-5 text-green-500" />;
    case 'WARN':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'ERROR':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    default:
      return <ShieldCheck className="w-5 h-5 text-gray-400" />;
  }
};

const SecurityLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        // Nota: Este endpoint `getSecurityLogs` precisaria ser criado no backend.
        const response = await adminService.getSecurityLogs();
        if (response.success) {
          setLogs(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch security logs:", error);
        // Exemplo de logs em caso de falha na API, para visualização
        setLogs([
          { id: '1', timestamp: new Date().toISOString(), level: 'ERROR', actor: 'System', action: 'FETCH_LOGS_FAILED', details: 'Não foi possível carregar os logs do servidor.' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Logs de Segurança</h1>
          <p className="text-gray-600 mb-8">Atividade recente e eventos de segurança na plataforma.</p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-4">
            {isLoading ? (
              <p className="text-center text-gray-500 py-8">A carregar logs...</p>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 border-b border-gray-100 last:border-b-0">
                  <div className="mt-1"><LogIcon level={log.level} /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{log.action}</p>
                    <p className="text-sm text-gray-600">{log.details}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                      <span className="flex items-center gap-1"><User size={12} /> {log.actor}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhum log de segurança encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;