import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { Solution } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: Solution;
  onReviewComplete: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, solution, onReviewComplete }) => {
  const [status, setStatus] = useState<string>(solution.status === 'PENDING_REVIEW' ? 'ACCEPTED' : solution.status);
  const [rating, setRating] = useState<number>(solution.rating || 0);
  const [feedback, setFeedback] = useState<string>(solution.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.put(`/solutions/${solution.id}`, {
        status,
        rating,
        feedback
      });
      toast.success('Avaliação submetida com sucesso!');
      onReviewComplete();
      onClose();
    } catch (error) {
      console.error('Erro ao avaliar solução:', error);
      toast.error('Erro ao submeter avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          {...({ className: "bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" } as any)}
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Avaliar Solução</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Decisão</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('ACCEPTED')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                    status === 'ACCEPTED' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-green-200'
                  }`}
                >
                  <CheckCircle size={20} />
                  <span className="font-medium">Aceitar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('REJECTED')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                    status === 'REJECTED' 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-gray-200 hover:border-red-200'
                  }`}
                >
                  <AlertCircle size={20} />
                  <span className="font-medium">Rejeitar</span>
                </button>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Classificação (1-5)</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={`${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Privado</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                placeholder="Deixe uma mensagem para o estudante (pontos fortes, áreas a melhorar)..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-solve-blue text-white py-3 rounded-xl font-semibold hover:bg-solve-purple transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'A submeter...' : 'Confirmar Avaliação'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewModal;