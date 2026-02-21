import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ComingSoon = ({ title }: { title: string }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
       {...({className: "text-center max-w-lg" } as any)}
      >
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Construction className="w-12 h-12 text-solve-blue" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 mb-8">
          Estamos a trabalhar arduamente para trazer esta funcionalidade até si. 
          Fique atento às novidades!
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-solve-blue font-semibold hover:text-solve-purple transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar à página inicial</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default ComingSoon;