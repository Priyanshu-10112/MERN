import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    enum: ['csv', 'xlsx', 'xls'],
    required: true
  },
  rowCount: {
    type: Number,
    default: 0
  },
  columnCount: {
    type: Number,
    default: 0
  },
  columns: [{
    type: String
  }],
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Upload', uploadSchema);
