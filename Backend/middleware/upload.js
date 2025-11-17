const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Criar diretório de uploads se não existir
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'general';
    
    if (file.fieldname === 'avatar') {
      folder = 'avatars';
    } else if (file.fieldname === 'solutionFiles') {
      folder = 'solutions';
    } else if (file.fieldname === 'challengeFiles') {
      folder = 'challenges';
    }

    const dir = `${uploadDir}/${folder}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Nome único para o ficheiro
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtros de ficheiro
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'text/plain': true,
    'application/zip': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de ficheiro não suportado'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5 // máximo 5 ficheiros
  }
});

// Middlewares específicos
const uploadAvatar = upload.single('avatar');
const uploadSolutionFiles = upload.array('solutionFiles', 5);
const uploadChallengeFiles = upload.single('challengeFile');

// Middleware de erro
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Ficheiro demasiado grande. Máximo: 10MB' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Demasiados ficheiros. Máximo: 5' });
    }
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = {
  uploadAvatar,
  uploadSolutionFiles,
  uploadChallengeFiles,
  handleUploadError
};