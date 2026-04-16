import React, { useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth0 } from '@auth0/auth0-react';

interface SolutionUploadFormProps {
  problemId: string;
  onSuccess: () => void;
}

const SolutionUploadForm: React.FC<SolutionUploadFormProps> = ({ problemId, onSuccess }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) { // Limite 10MB
        toast.error('O ficheiro é demasiado grande. Máximo 10MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Selecione um ficheiro.');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('problemId', problemId);
    formData.append('title', `Solução para o desafio ${problemId}`);
    // ... outros campos como description, githubUrl

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/solutions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, 
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('Solução submetida com sucesso!');
        onSuccess();
      } else {
        throw new Error('Falha no upload');
      }
    } catch (error) {
      toast.error('Erro ao submeter a solução.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border-2 border-dashed border-gray-200 rounded-xl">
      <div className="flex items-center justify-center w-full">
        {!file ? (
          <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Clique para carregar o seu projeto (ZIP, PDF, etc.)</span>
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <File className="text-solve-blue" />
              <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
            </div>
            <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
              <X size={18} />
            </button>
          </div>
        )}
      </div>
      <button
        disabled={!file || uploading}
        className="w-full py-2 bg-solve-blue text-white rounded-lg disabled:opacity-50"
      >
        {uploading ? 'A enviar...' : 'Submeter Projeto'}
      </button>
    </form>
  );
};

export default SolutionUploadForm;