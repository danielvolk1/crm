const mongoose = require('mongoose');

const clientFileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalName: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadedByName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  description: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['contract', 'proposal', 'document', 'image', 'spreadsheet', 'other'],
    default: 'document'
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  base64Data: { type: String, default: '' }
});

module.exports = mongoose.model('ClientFile', clientFileSchema);
