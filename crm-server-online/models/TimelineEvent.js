const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['comment', 'status_change', 'meeting', 'call', 'email', 'deal_update'],
    default: 'comment'
  },
  content: { type: String, required: true },
  oldValue: { type: String, default: '' },
  newValue: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);
