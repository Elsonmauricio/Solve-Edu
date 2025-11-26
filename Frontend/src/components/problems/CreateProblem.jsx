import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';

const CreateProblem = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    category: '',
    difficulty: '',
    tags: [],
    deadline: '',
    reward: '',
    requirements: [''],
    newTag: ''
  });

  const categories = ['Tecnologia', 'Sustentabilidade', 'Saúde', 'Educação', 'Negócios'];
  const difficulties = ['Iniciante', 'Intermediário', 'Avançado'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const handleRemoveRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newProblem = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      company: formData.company,
      category: formData.category,
      difficulty: formData.difficulty,
      tags: formData.tags,
      deadline: formData.deadline,
      reward: formData.reward,
      requirements: formData.requirements.filter(req => req.trim()),
      solutionsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    dispatch({
      type: 'ADD_PROBLEM',
      payload: newProblem
    });

    navigate('/company-dashboard');
  };

  const isFormValid = formData.title && formData.description && formData.company && 
                     formData.category && formData.difficulty && formData.deadline;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <motion.div
        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-black text-gray-900 mb-2">Publicar Novo Desafio</h1>
        <p className="text-gray-600 mb-8">
          Partilhe um desafio real da sua empresa e encontre soluções inovadoras da comunidade estudantil
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Desafio *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                  placeholder="Ex: Sistema de Gestão de Inventário Inteligente"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                  placeholder="Nome da sua empresa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                  required
                >
                  <option value="">Selecionar categoria</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificuldade *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                  required
                >
                  <option value="">Selecionar dificuldade</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição Detalhada *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
              placeholder="Descreva o desafio em detalhe, incluindo o contexto, objetivos e resultados esperados..."
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags e Tecnologias
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.newTag}
                onChange={(e) => handleInputChange('newTag', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                placeholder="Adicionar tag (ex: Python, Machine Learning...)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Requisitos Técnicos
              </label>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="flex items-center space-x-2 text-sm text-solve-blue hover:text-solve-purple"
              >
                <Plus size={16} />
                <span>Adicionar requisito</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                    placeholder="Ex: Conhecimentos em Python e APIs REST"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline & Reward */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prazo para Submissão *
              </label>
              <select
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                required
              >
                <option value="">Selecionar prazo</option>
                <option value="15 dias">15 dias</option>
                <option value="30 dias">30 dias</option>
                <option value="45 dias">45 dias</option>
                <option value="60 dias">60 dias</option>
                <option value="90 dias">90 dias</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recompensa (Opcional)
              </label>
              <input
                type="text"
                value={formData.reward}
                onChange={(e) => handleInputChange('reward', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                placeholder="Ex: €1.500, Estágio, Prémio..."
              />
            </div>
          </div>

          {/* Additional Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentos de Apoio (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">
                Arraste ficheiros ou <span className="text-solve-blue cursor-pointer">procure no seu computador</span>
              </p>
              <p className="text-sm text-gray-500">
                PDF, DOC, PPT até 10MB
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="flex-1 bg-gradient-to-r from-solve-blue to-solve-purple text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publicar Desafio
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateProblem;