const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  area: { 
    type: String, 
    enum: ['technology', 'design', 'marketing', 'sustainability', 'management', 'engineering', 'health', 'education'],
    required: true 
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  reward: {
    type: {
      type: String,
      enum: ['monetary', 'internship', 'mentorship', 'partnership', 'prize', 'none']
    },
    value: String,
    amount: Number
  },
  deadline: { 
    type: Date, 
    required: true 
  },
  requirements: [String],
  skillsRequired: [String],
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'completed', 'draft'], 
    default: 'active' 
  },
  tags: [String],
  views: { type: Number, default: 0 },
  applications: { type: Number, default: 0 },
  
  // Metadata
  isFeatured: { type: Boolean, default: false },
  attachment: String
}, { 
  timestamps: true 
});

// Index para pesquisa
challengeSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Challenge', challengeSchema);