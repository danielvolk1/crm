const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  target: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
