import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  uploadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload',
    required: true
  },
  analysisType: {
    type: String,
    enum: ['auto-ai', 'column-based', 'team-evaluation', 'flexible'],
    required: true
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  insights: [{
    type: String
  }],
  summary: {
    type: String
  },
  metadata: {
    processingTime: String,
    recordCount: Number,
    aiModel: String
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Analysis', analysisSchema);
