import { supabase } from '../lib/supabase.js';
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  /**
   * Faz o upload de um ficheiro para um bucket específico no Supabase Storage.
   * @param {object} file - O objeto do ficheiro (do multer).
   * @param {string} bucket - O nome do bucket de destino.
   * @returns {Promise<string>} - A URL pública do ficheiro.
   */
  async uploadFile(file, bucket) {
    if (!file) {
      throw new Error('Nenhum ficheiro fornecido para upload.');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(`Erro no upload para o Supabase: ${error.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }
}

export const storageService = new StorageService();