import React from 'react';
import { motion } from 'framer-motion';
import { School, FileCheck } from 'lucide-react';

const ChildProtection = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          {...({ className:"bg-white rounded-2xl shadow-sm p-8 md:p-12"} as any)}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Proteção de Menores</h1>

          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-8">
              A segurança dos menores é uma prioridade absoluta na SolveEdu. Implementamos medidas rigorosas 
              para garantir um ambiente seguro para alunos menores de 18 anos.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <School className="w-5 h-5 text-solve-blue" />
                Supervisão Escolar
              </h2>
              <p className="text-gray-600">
                A participação de alunos menores de 18 anos na plataforma requer a vinculação a uma 
                instituição de ensino registada. As escolas têm acesso a ferramentas de supervisão 
                para acompanhar as atividades dos seus alunos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-solve-blue" />
                Consentimento e Dados
              </h2>
              <p className="text-gray-600">
                O tratamento de dados de menores é realizado apenas com consentimento explícito 
                dos encarregados de educação ou através da autorização institucional da escola, 
                no âmbito das atividades letivas.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChildProtection;