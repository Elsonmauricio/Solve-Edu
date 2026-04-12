import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload, Github, Link as LinkIcon, Loader, FileText, Trash2 } from 'lucide-react';
import { Solution, Problem, User } from '../../types';
import toast from 'react-hot-toast';
import { useSolutions, CreateSolutionDto } from '../../hooks/useSolutions';
import { problemsService } from '../../services/problems.service';

const SubmitSolution = () => {
  const { id } = useParams();
  const { problems, dispatch, user } = useApp();
  const navigate = useNavigate();
  const { createSolution, loading: isSubmitting } = useSolutions();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoadingProblem, setIsLoadingProblem] = useState(true);

  useEffect(() => {
    const loadProblem = async () => {
      if (!id) return;
      
      // Tenta encontrar no contexto primeiro (convertendo ID para string para garantir compatibilidade com UUIDs)
      const found = problems.find((p: Problem) => String(p.id) === id);
      
      if (found) {
        setProblem(found);
        setIsLoadingProblem(false);
      } else {
        // Se não encontrar (ex: refresh da página), busca na API
        try {
          const response = await problemsService.getById(id);
          if (response.success) {
            setProblem(response.data as any);
          }
        } catch (error) {
          console.error('Erro ao carregar desafio:', error);
          toast.error('Não foi possível carregar os detalhes do desafio.');
        } finally {
          setIsLoadingProblem(false);
        }
      }
    };

    loadProblem();
  }, [id, problems]);

  interface SolutionFormState {
    title: string;
    description: string;
    technologies: string[];
    githubUrl: string;
    demoUrl: string;
    documentation: string;
    newTech: string;
  }

  const [formData, setFormData] = useState<SolutionFormState>({
    title: '',
    description: '',
    technologies: [],
    githubUrl: '',
    demoUrl: '',
    documentation: '',
    newTech: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleInputChange = (field: keyof SolutionFormState, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTechnology = () => {
    if (formData.newTech.trim() && !formData.technologies.includes(formData.newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, prev.newTech.trim()],
        newTech: ''
      }));
    }
  };

  const handleRemoveTechnology = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!problem) return;

    // O hook gere o estado de loading
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('problemId', String(problem.id));
      
      formData.technologies.forEach(tech => {
        submitData.append('technologies', tech);
      });

      if (formData.githubUrl) submitData.append('githubUrl', formData.githubUrl);
      if (formData.demoUrl) submitData.append('demoUrl', formData.demoUrl);
      if (formData.documentation) submitData.append('documentation', formData.documentation);
      
      if (selectedFile) {
        submitData.append('file', selectedFile);
      }

      await createSolution(submitData as any);
      toast.success('Solução submetida com sucesso!');
      navigate('/student-dashboard');
    } catch (error: any) {
      console.error('Error submitting solution:', error);
      // Extrai a mensagem de erro específica do backend
      const apiError = error.response?.data;
      
      // Define a mensagem inicial
      let errorMessage = apiError?.message || 'Erro ao submeter solução. Tente novamente.';
      
      if (apiError?.errors && Array.isArray(apiError.errors)) {
        errorMessage = apiError.errors.map((e: any) => e.msg).join('. ');
      }

      toast.error(errorMessage);
      if (apiError?.errors) {
        console.error('Validation Errors:', apiError.errors);
      }
    }
  };

  const isFormValid = formData.title && formData.description && formData.technologies.length > 0;

  if (isLoadingProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={40} className="animate-spin text-solve-blue" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Problema não encontrado</h2>
          <p className="text-gray-600 mb-6">O problema que procura não existe ou foi removido.</p>
          <button 
            onClick={() => navigate('/problems')}
            className="bg-solve-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-solve-purple transition-colors"
          >
            Voltar aos Problemas
          </button>
        </div>
      </div>
    );
  }

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

      {/* Problem Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{problem.title}</h2>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">{typeof problem.company === 'string' ? problem.company : problem.company?.companyName || "Confidencial"}</p>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{problem.description}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Submeter Solução</h1>
        <p className="text-gray-600 mb-8">
          Partilhe a sua solução inovadora para este desafio. Esta pode ser a sua Prova de Aptidão Profissional!
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Informações da Solução</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Solução *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                  placeholder="Ex: SmartInventory - Sistema Inteligente de Gestão"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição Detalhada *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                  placeholder="Descreva a sua solução em detalhe, incluindo a abordagem, funcionalidades principais e como resolve o problema..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tecnologias Utilizadas *
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.technologies.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnology(tech)}
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
                value={formData.newTech}
                onChange={(e) => handleInputChange('newTech', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                placeholder="Adicionar tecnologia (ex: React, Python, MongoDB...)"
              />
              <button
                type="button"
                onClick={handleAddTechnology}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            {formData.technologies.length === 0 && (
              <p className="text-xs text-orange-500 mt-1">
                ⚠️ Adicione pelo menos uma tecnologia clicando no botão + ou pressionando Enter.
              </p>
            )}
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Github className="inline w-4 h-4 mr-2" />
                Repositório GitHub
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                placeholder="https://github.com/username/repository"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LinkIcon className="inline w-4 h-4 mr-2" />
                Demo URL (Opcional)
              </label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
                placeholder="https://your-demo-app.com"
              />
            </div>
          </div>

          {/* Documentation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentação (Opcional)
            </label>
            <textarea
              value={formData.documentation}
              onChange={(e) => handleInputChange('documentation', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-solve-blue focus:border-transparent"
              placeholder="Inclua informações sobre instalação, configuração, ou qualquer documentação adicional..."
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ficheiros Adicionais (Opcional)
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.zip,.rar"
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
                  PDF, DOC, ZIP até 25MB
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

          {/* PAP Information */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              🎓 Esta solução é a sua Prova de Aptidão Profissional?
            </h3>
            <p className="text-blue-700 mb-4">
              Se esta solução faz parte da sua PAP, marque a opção abaixo e inclua informações adicionais que possam ser relevantes para a avaliação.
            </p>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="w-4 h-4 text-solve-blue focus:ring-solve-blue border-gray-300 rounded"
              />
              <span className="text-blue-800 font-medium">Sim, esta é a minha Prova de Aptidão Profissional</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <div className="flex-1 flex flex-col">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-solve-blue to-solve-purple text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader size={20} className="animate-spin" />}
                {isSubmitting ? 'Submetendo...' : 'Submeter Solução'}
              </button>
              {!isFormValid && (
                <p className="text-xs text-red-500 text-center mt-2">
                  Preencha o título, descrição e adicione pelo menos uma tecnologia para continuar.
                </p>
              )}
            </div>
          </div>
        </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SubmitSolution;