import React from 'react';
import { motion } from 'framer-motion';
import ProblemList from '../components/problems/ProblemList';

const Problems = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <ProblemList />
      </motion.div>
    </div>
  );
};

export default Problems;