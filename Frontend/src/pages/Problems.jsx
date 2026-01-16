import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProblemList from '../components/problems/ProblemList';
import { problemsService } from '../services/problems.service';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await problemsService.getAll();
        if (response.success) {
          setProblems(response.data.problems);
        } else {
          setError(response.message || 'Falha ao carregar os desafios.');
        }
      } catch (err) {
        setError('Ocorreu um erro de rede. Tente novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <ProblemList problems={problems} loading={loading} error={error} />
      </motion.div>
    </div>
  );
};

export default Problems;