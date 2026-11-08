const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Submission = require('../models/Submission');

// @route   POST /api/submissions
// @desc    Save a code comparison result
// @access  Private (Protected)
router.post('/', auth, async (req, res) => {
  const {
    title,
    codeA,
    codeB,
    similarity,
    jaccardSimilarity,
    levenshteinDistance,
    matchedLinesCount,
    matchedLinesA,
    matchedLinesB,
  } = req.body;

  try {
    if (codeA === undefined || codeB === undefined || similarity === undefined) {
      return res.status(400).json({ message: 'Missing required submission fields (codeA, codeB, similarity)' });
    }

    const newSubmission = new Submission({
      user: req.user.id,
      title: title || 'Untitled Comparison',
      codeA,
      codeB,
      similarity,
      jaccardSimilarity: jaccardSimilarity || 0,
      levenshteinDistance: levenshteinDistance || 0,
      matchedLinesCount: matchedLinesCount || 0,
      matchedLinesA: matchedLinesA || [],
      matchedLinesB: matchedLinesB || [],
    });

    const submission = await newSubmission.save();
    res.status(201).json(submission);
  } catch (err) {
    console.error('Save submission error:', err.message);
    res.status(500).json({ message: 'Server error saving code comparison' });
  }
});

// @route   GET /api/submissions/user
// @desc    Get all comparison history for the logged-in user
// @access  Private (Protected)
router.get('/user', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user.id })
      .sort({ createdAt: -1 }); // newest first
    res.json(submissions);
  } catch (err) {
    console.error('Fetch user submissions error:', err.message);
    res.status(500).json({ message: 'Server error fetching user submissions' });
  }
});

module.exports = router;
