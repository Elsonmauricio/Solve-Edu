import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

class FileService {
  constructor() {
    this.uploadDir = 'uploads';
    
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Configure multer for file upload
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        let folder = 'general';
        
        // Organize files by type
        if (file.mimetype.startsWith('image/')) {
          folder = 'images';
        } else if (file.mimetype.startsWith('video/')) {
          folder = 'videos';
        } else if (file.mimetype.includes('pdf')) {
          folder = 'documents';
        } else if (file.mimetype.includes('zip') || file.mimetype.includes('compressed')) {
          folder = 'archives';
        }

        const uploadPath = path.join(this.uploadDir, folder);
        
        // Create folder if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    // File filter
    this.fileFilter = (req, file, cb) => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed'
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de ficheiro não suportado'), false);
      }
    };

    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      }
    });
  }

  // Middleware for file upload
  getUploadMiddleware(fieldName = 'file', maxCount = 1) {
    if (maxCount > 1) {
      return this.upload.array(fieldName, maxCount);
    }
    return this.upload.single(fieldName);
  }

  // Save file information to database
  async saveFileInfo(file, userId, context = 'general') {
    try {
      const fileInfo = {
        id: uuidv4(),
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadedBy: userId,
        context,
        uploadedAt: new Date(),
      };

      // In a real application, save to database
      // For now, we'll just return the file info
      return fileInfo;
    } catch (error) {
      console.error('Error saving file info:', error);
      throw new Error('Failed to save file information');
    }
  }

  // Delete file
  async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Get file URL for frontend
  getFileUrl(filename, folder = 'general') {
    return `/api/files/${folder}/${filename}`;
  }

  // Serve file
  async serveFile(res, filename, folder = 'general') {
    try {
      const filePath = path.join(this.uploadDir, folder, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Ficheiro não encontrado'
        });
      }

      // Set appropriate headers
      const ext = path.extname(filename).toLowerCase();
      const contentType = this.getContentType(ext);
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao servir ficheiro'
      });
    }
  }

  getContentType(ext) {
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  // Validate file size
  validateFileSize(file, maxSizeMB = 10) {
    const maxSize = maxSizeMB * 1024 * 1024;
    return file.size <= maxSize;
  }

  // Get file statistics
  async getFileStats() {
    try {
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        byType: {},
        byFolder: {},
      };

      const getFolderStats = (folderPath) => {
        let folderStats = {
          count: 0,
          size: 0,
        };

        if (fs.existsSync(folderPath)) {
          const files = fs.readdirSync(folderPath);
          
          files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isFile()) {
              folderStats.count++;
              folderStats.size += stat.size;
            }
          });
        }

        return folderStats;
      };

      // Get stats for each folder
      const folders = ['images', 'videos', 'documents', 'archives', 'general'];
      
      folders.forEach(folder => {
        const folderPath = path.join(this.uploadDir, folder);
        const folderStats = getFolderStats(folderPath);
        
        stats.byFolder[folder] = folderStats;
        stats.totalFiles += folderStats.count;
        stats.totalSize += folderStats.size;
      });

      // Convert size to human readable format
      stats.totalSizeHR = this.formatFileSize(stats.totalSize);

      return stats;
    } catch (error) {
      console.error('Error getting file stats:', error);
      throw new Error('Failed to get file statistics');
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new FileService();