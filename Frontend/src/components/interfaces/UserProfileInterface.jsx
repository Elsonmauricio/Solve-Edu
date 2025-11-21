import { motion } from 'framer-motion';
import { NeoButton } from '../ui/NeoButton';
import { QuantumText } from '../ui/QuantumText';

export const UserProfileInterface = ({ onBack }) => {
  return (
    <main className="max-w-4xl mx-auto px-6 lg:px-8 py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-5xl font-black text-gray-800 mb-4">
          <QuantumText>👤 Perfil do Usuário</QuantumText>
        </h2>
        <p className="text-gray-600 text-xl mb-12">Aqui você poderá ver e editar as informações do seu perfil.</p>
        <NeoButton onClick={onBack}>← Voltar</NeoButton>
      </motion.div>
    </main>
  );
};