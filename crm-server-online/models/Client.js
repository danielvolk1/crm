const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['just_deposited', 'not_answering', 'pitched', 'broke', 'waiting_for_funds'],
    default: 'just_deposited'
  },
  potential: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dealValue: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  assignedTo: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastContact: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', clientSchema);
