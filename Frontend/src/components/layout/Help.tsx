import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="text-lg font-medium text-gray-900">{question}</span>
        {isOpen ? <ChevronUp className="text-solve-blue" /> : <ChevronDown className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            {...({className:"overflow-hidden"} as any)}
          >
            <p className="pb-6 text-gray-600 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Help = () => {
  const faqs = [
    {
      question: "O que é o SolveEdu?",
      answer: "O SolveEdu é uma plataforma que conecta estudantes a empresas através de desafios reais. As empresas publicam problemas que precisam de resolver e os estudantes desenvolvem soluções, que podem servir como Provas de Aptidão Profissional (PAP)."
    },
    {
      question: "Como posso submeter a minha PAP?",
      answer: "Após criar uma conta de estudante, pode navegar pelos desafios disponíveis. Ao escolher um desafio, clique em 'Resolver Desafio' para iniciar o processo. Quando terminar, pode submeter a sua solução através do dashboard."
    },
    {
      question: "As empresas pagam pelas soluções?",
      answer: "O modelo base é colaborativo e educacional. No entanto, as empresas podem oferecer recompensas, estágios ou oportunidades de emprego aos estudantes com as melhores soluções."
    },
    {
      question: "Como funciona a validação pela escola?",
      answer: "A sua escola deve estar registada na plataforma. Quando submete uma solução como PAP, o seu professor ou coordenador recebe uma notificação para validar o projeto academicamente."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          {...({className:"text-center mb-12"} as any)}
        >
          <HelpCircle className="w-16 h-16 text-solve-blue mx-auto mb-4" />
          <h1 className="text-4xl font-black text-gray-900 mb-4">Centro de Ajuda</h1>
          <p className="text-xl text-gray-600">Perguntas frequentes sobre a plataforma</p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;