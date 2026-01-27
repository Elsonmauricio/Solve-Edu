import React from 'react';
import { motion } from 'framer-motion';

const QuantumBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '256px',
          height: '256px',
          backgroundColor: '#BFDBFE',
          borderRadius: '9999px',
          mixBlendMode: 'multiply',
          filter: 'blur(80px)',
          opacity: 0.2
        }}
      />
      
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '50%',
          right: '25%',
          width: '384px',
          height: '384px',
          backgroundColor: '#E9D5FF',
          borderRadius: '9999px',
          mixBlendMode: 'multiply',
          filter: 'blur(80px)',
          opacity: 0.2
        }}
      />
      
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -100, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '50%',
          width: '320px',
          height: '320px',
          backgroundColor: '#99F6E4',
          borderRadius: '9999px',
          mixBlendMode: 'multiply',
          filter: 'blur(80px)',
          opacity: 0.2
        }}
      />
    </div>
  );
};

export default QuantumBackground;