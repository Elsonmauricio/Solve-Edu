const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  userType: { 
    type: String, 
    enum: ['student', 'company', 'school', 'admin'], 
    required: true 
  },
  
  // Campos específicos para estudantes
  studentProfile: {
    school: String,
    course: String,
    year: Number,
    skills: [String],
    bio: String,
    portfolio: String,
    cv: String
  },
  
  // Campos específicos para empresas
  companyProfile: {
    companyName: String,
    industry: String,
    size: String,
    website: String,
    description: String,
    location: String
  },
  
  // Campos específicos para escolas
  schoolProfile: {
    schoolName: String,
    address: String,
    contactPerson: String,
    courses: [String]
  },
  
  avatar: String,
  isVerified: { type: Boolean, default: false },
  lastLogin: Date
}, { 
  timestamps: true 
});

// Método para esconder a password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);