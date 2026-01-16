import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SolutionList from '../components/solutions/SolutionList';
import { solutionsService } from '../services/solutions.service';

const Solutions = () => {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        const response = await solutionsService.getAll();
        if (response.success) {
          setSolutions(response.data.solutions);
        } else {
          setError(response.message || 'Falha ao carregar as soluções.');
        }
      } catch (err) {
        setError('Ocorreu um erro de rede. Tente novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <SolutionList solutions={solutions} loading={loading} error={error} />
      </motion.div>
    </div>
  );
};

export default Solutions;