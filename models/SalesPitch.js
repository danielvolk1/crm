const mongoose = require('mongoose');

const salesPitchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['pitch', 'call_structure', 'script', 'objection_handler'],
    default: 'pitch'
  },
  category: { type: String, default: 'General' },
  content: { type: String, required: true },
  steps: [{ type: String }],
  tips: [{ type: String }],
  duration: { type: Number, default: 5 },
  createdBy: { type: String, required: true },
  createdByName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SalesPitch', salesPitchSchema);
