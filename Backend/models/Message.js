const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  challenge: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Challenge' 
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  readAt: Date
}, { 
  timestamps: true 
});

// Index para melhor performance nas queries de conversas
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);