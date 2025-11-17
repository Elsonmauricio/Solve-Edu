const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  challenge: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Challenge', 
    required: true 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  files: [{
    filename: String,
    originalName: String,
    url: String,
    type: String,
    size: Number
  }],
  repositoryUrl: String,
  demoUrl: String,
  status: { 
    type: String, 
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'selected'], 
    default: 'submitted' 
  },
  feedback: {
    companyFeedback: String,
    rating: { type: Number, min: 1, max: 5 },
    reviewedAt: Date,
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  score: Number,
  isPublic: { type: Boolean, default: false }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Solution', solutionSchema);