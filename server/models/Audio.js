const mongoose = require('mongoose');



const AudioSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  isProcessed: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model('Audio', AudioSchema);





