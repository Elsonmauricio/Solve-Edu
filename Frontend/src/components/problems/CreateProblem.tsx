import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { problemsService } from '../../services/problems.service';
import { ArrowLeft, Plus, X, Upload, Loader, FileText, Trash2 } from 'lucide-react';
import { Problem } from '../../types';
import toast from 'react-hot-toast';

interface FormData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  deadline: string;
  reward: string;
  requirements: string[];
  newTag: string;
}

const CreateProblem = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    tags: [],
    deadline: '',
    reward: '',
    requirements: [''],
    newTag: ''
  });

  const categories = ['TECHNOLOGY', 'SUSTAINABILITY', 'HEALTH', 'EDUCATION', 'BUSINESS', 'DESIGN', 'SCIENCE', 'ENGINEERING'];
  const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  const handleInputChange = (field: keyof FormData, value: any) => {
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

  const handleRemoveTag = (tagToRemove: string) => {
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

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Calcular a data de deadline
      const deadlineDays = parseInt(formData.deadline.split(' ')[0]);
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);

      // Criar FormData para envio de ficheiro
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('difficulty', formData.difficulty);
      submitData.append('deadline', deadlineDate.toISOString());
      if (formData.reward) submitData.append('reward', formData.reward);
      
      formData.tags.forEach(tag => submitData.append('tags', tag));
      formData.requirements.filter(req => req.trim()).forEach(req => submitData.append('requirements', req));
      
      if (selectedFile) {
        submitData.append('file', selectedFile);
      }

      // O token é adicionado automaticamente pelo intercetor da API
      const response = await problemsService.create(submitData as any);

      if (response.success) {
        toast.success('Desafio criado com sucesso!');
        navigate('/company-dashboard');
      } else {
        toast.error((response as any).message || 'Erro ao criar desafio');
      }
    } catch (error: any) {
      console.error('Error creating problem:', error);
      // Tenta mostrar a mensagem específica do backend se existir
      // Prioridade ao erro técnico (data.error) para facilitar o debug
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 
                           (error.response?.data?.errors ? 'Erro nos dados do formulário' : 'Erro ao criar desafio. Tente novamente.');
      
      toast.error(errorMessage);
      if (error.response?.data?.errors) console.log('Validation errors:', error.response.data.errors);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.title && formData.description &&
    formData.category && formData.difficulty && formData.deadline;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Publicar Novo Desafio</h1>
          <p className="text-gray-600 mb-8">
            Partilhe um desafio real da sua empresa e encontre soluções inovadoras da comunidade estudantil
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recompensa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.reward}
                    onChange={(e) => handleInputChange('reward', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                    placeholder="Ex: €500 ou Estágio"
                  />
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Detalhada *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                minLength={50}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent ${
                  formData.description.length > 0 && formData.description.length < 50 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-gray-300'
                }`}
                placeholder="Descreva o desafio em detalhe, incluindo o contexto, objetivos e resultados esperados..."
                required
              />
              <div className={`text-xs mt-1 text-right ${formData.description.length > 0 && formData.description.length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.description.length}/5000 (Mínimo 50 caracteres)
              </div>
            </div>

            {/* Tags Section */}
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

            {/* Requirements Section */}
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

            {/* Deadline & Reward Section */}
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
                  Recompensa Adicional (Opcional)
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

            {/* Documents Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documentos de Apoio (Opcional)
              </label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              />

              {!selectedFile ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-solve-blue hover:bg-blue-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">
                    Clique para fazer upload de um documento
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, DOC, PPT até 10MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Buttons Section */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isLoading}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="flex items-center justify-center gap-2 flex-1 bg-gradient-to-r from-solve-blue to-solve-purple text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader size={20} className="animate-spin" />}
                {isLoading ? 'Publicando...' : 'Publicar Desafio'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateProblem;
