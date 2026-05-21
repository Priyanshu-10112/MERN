import mongoose from 'mongoose';

const projectAnalysisSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D', 'F']
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  suggestions: [{
    type: String
  }],
  summary: {
    totalUpdates: Number,
    averageCompletion: Number,
    lastUpdateDate: Date,
    consistencyScore: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
projectAnalysisSchema.index({ teamId: 1, createdAt: -1 });

export default mongoose.model('ProjectAnalysis', projectAnalysisSchema);
