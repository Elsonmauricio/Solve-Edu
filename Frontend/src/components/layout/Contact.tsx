import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/contact', formData);
      if (response.data.success) {
        toast.success('Mensagem enviada com sucesso! Entraremos em contacto brevemente.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(response.data.message || 'Ocorreu um erro.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Não foi possível enviar a sua mensagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          {...({className:"text-center mb-12"} as any)}
        >
          <h1 className="text-4xl font-black text-gray-900 mb-4">Fale Connosco</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tem dúvidas, sugestões ou quer estabelecer uma parceria? Estamos aqui para ajudar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <Mail className="w-8 h-8 text-solve-blue mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-4">Para questões gerais e suporte.</p>
              <a href="mailto:hello@solveedu.pt" className="text-solve-blue font-medium hover:underline">hello@solveedu.pt</a>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <Phone className="w-8 h-8 text-solve-purple mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Telefone</h3>
              <p className="text-gray-600 mb-4">Seg-Sex, das 9h às 18h.</p>
              <a href="tel:+351210000000" className="text-solve-purple font-medium hover:underline">+351 210 000 000</a>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <MapPin className="w-8 h-8 text-solve-teal mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Escritório</h3>
              <p className="text-gray-600">
                Av. da Liberdade, 100<br />
                1250-000 Lisboa, Portugal
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              {...({className:"bg-white rounded-2xl shadow-lg border border-gray-200 p-8"} as any)}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-solve-blue focus:border-transparent outline-none transition-all" placeholder="O seu nome" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-solve-blue focus:border-transparent outline-none transition-all" placeholder="seu@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assunto</label>
                  <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-solve-blue focus:border-transparent outline-none transition-all" placeholder="Como podemos ajudar?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                  <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-solve-blue focus:border-transparent outline-none transition-all" placeholder="Escreva a sua mensagem aqui..." />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-solve-blue to-solve-purple text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {isSubmitting ? 'A enviar...' : <><span>Enviar Mensagem</span><Send size={20} /></>}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;