import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Server, Lock, FileSearch } from 'lucide-react';

const Security = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
         {...({ className: "bg-white rounded-2xl shadow-sm p-8 md:p-12"} as any)}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Segurança</h1>

          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-8">
              Adotamos as melhores práticas da indústria para garantir a integridade, 
              confidencialidade e disponibilidade dos seus dados.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <Lock className="w-8 h-8 text-solve-blue mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Criptografia</h3>
                <p className="text-gray-600 text-sm">
                  Todas as comunicações são encriptadas via HTTPS (TLS 1.2+). 
                  Dados sensíveis são armazenados com criptografia em repouso.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <Server className="w-8 h-8 text-solve-blue mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Backups</h3>
                <p className="text-gray-600 text-sm">
                  Realizamos backups automáticos diários de todos os dados, 
                  com retenção segura para prevenção de perda de informação.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <ShieldCheck className="w-8 h-8 text-solve-blue mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Controle de Acesso</h3>
                <p className="text-gray-600 text-sm">
                  Implementamos autenticação robusta via Auth0 e políticas de 
                  autorização baseadas em funções (RBAC) para restringir o acesso.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <FileSearch className="w-8 h-8 text-solve-blue mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Auditoria</h3>
                <p className="text-gray-600 text-sm">
                  Mantemos logs de auditoria detalhados para monitorizar atividades 
                  críticas e detetar comportamentos suspeitos.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Security;