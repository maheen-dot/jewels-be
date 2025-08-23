const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  device: {
    type: String, // e.g., 'Desktop', 'Mobile', 'Tablet'
  },
  browser: {
    type: String,
  },
  os: {
    type: String,
  },
  referrer: {
    type: String, // URL of the page they came from
  },
  pageVisited: {
    type: String, // URL or route visited
  },
  visitTime: {
    type: Date,
    default: Date.now,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  }
  
});

module.exports = mongoose.model('Visitor', visitorSchema);
