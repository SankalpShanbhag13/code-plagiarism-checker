const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'Untitled Comparison',
    trim: true,
  },
  codeA: {
    type: String,
    required: true,
  },
  codeB: {
    type: String,
    required: true,
  },
  similarity: {
    type: Number,
    required: true,
  },
  jaccardSimilarity: {
    type: Number,
    required: true,
  },
  levenshteinDistance: {
    type: Number,
    required: true,
  },
  matchedLinesCount: {
    type: Number,
    required: true,
  },
  matchedLinesA: {
    type: [Number],
    default: [],
  },
  matchedLinesB: {
    type: [Number],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Submission', SubmissionSchema);
