import { motion } from 'framer-motion';
import { NeoButton } from '../ui/NeoButton';
import { QuantumText } from '../ui/QuantumText';

export const PapSubmissionInterface = ({ onBack }) => {
  return (
    <main className="max-w-4xl mx-auto px-6 lg:px-8 py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-5xl font-black text-gray-800 mb-4">
          <QuantumText>🚀 Submissão de PAP</QuantumText>
        </h2>
        <p className="text-gray-600 text-xl mb-12">Este é o formulário para submeter um novo projeto ou PAP.</p>
        <NeoButton onClick={onBack}>← Voltar</NeoButton>
      </motion.div>
    </main>
  );
};