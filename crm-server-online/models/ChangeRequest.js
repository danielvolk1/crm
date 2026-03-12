const mongoose = require('mongoose');

const changeRequestSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  requestedBy: { type: String, required: true },
  requesterName: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['comment_edit', 'comment_delete', 'step_change'],
    required: true
  },
  originalValue: { type: String, required: true },
  proposedValue: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reason: { type: String, default: '' },
  reviewedAt: { type: Date },
  reviewedBy: { type: String },
  reviewerName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChangeRequest', changeRequestSchema);
