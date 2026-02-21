import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
         {...({ className: "bg-white rounded-2xl shadow-sm p-8 md:p-12"} as any)}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-6">
              A sua privacidade é fundamental para nós. Esta política descreve como a SolveEdu recolhe, 
              usa e protege as suas informações pessoais, em conformidade com o RGPD.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-solve-blue" />
                Recolha e Uso de Dados
              </h2>
              <p className="text-gray-600 mb-4">
                Recolhemos apenas os dados necessários para o funcionamento da plataforma:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li><strong>Dados de Identificação:</strong> Nome, email, e foto de perfil (via Auth0).</li>
                <li><strong>Dados Académicos:</strong> Escola, curso e ano de escolaridade.</li>
                <li><strong>Conteúdo Gerado:</strong> Soluções submetidas, comentários e avaliações.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-solve-blue" />
                Cookies e Analytics
              </h2>
              <p className="text-gray-600 mb-4">
                Utilizamos cookies essenciais para manter a sua sessão segura e cookies de análise 
                para entender como a plataforma é utilizada.
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li><strong>Essenciais:</strong> Autenticação e segurança.</li>
                <li><strong>Analíticos:</strong> Métricas de uso anónimas para melhoria contínua.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-solve-blue" />
                Conformidade com RGPD
              </h2>
              <p className="text-gray-600 mb-4">
                Garantimos os seus direitos sobre os seus dados:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Direito de acesso e portabilidade.</li>
                <li>Direito à retificação ou esquecimento (eliminação).</li>
                <li>Consentimento explícito para tratamento de dados.</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;