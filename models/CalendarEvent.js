const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 30 },
  clientId: { type: String, default: '' },
  clientName: { type: String, default: '' },
  type: { 
    type: String, 
    enum: ['meeting', 'call', 'follow_up', 'demo', 'other'],
    default: 'meeting'
  },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
