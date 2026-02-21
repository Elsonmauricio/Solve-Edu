import React from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, Award } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          {...({ className: "bg-white rounded-2xl shadow-sm p-8 md:p-12"} as any)}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Uso</h1>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-solve-blue" />
                Direitos e Deveres
              </h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <h3 className="font-medium text-gray-900">Alunos</h3>
                  <p>Devem submeter trabalho original e manter conduta ética.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Empresas</h3>
                  <p>Comprometem-se a fornecer feedback construtivo e cumprir com as recompensas prometidas.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Escolas</h3>
                  <p>Responsáveis pela supervisão pedagógica dos seus alunos.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-solve-blue" />
                Responsabilidade sobre Conteúdos
              </h2>
              <p className="text-gray-600">
                A SolveEdu não se responsabiliza pelo conteúdo submetido pelos utilizadores. 
                Conteúdos ofensivos, ilegais ou que violem direitos de autor serão removidos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-solve-blue" />
                Desafios e Recompensas
              </h2>
              <p className="text-gray-600">
                As recompensas são da inteira responsabilidade das empresas promotoras. 
                A SolveEdu atua apenas como intermediária na divulgação e submissão.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;