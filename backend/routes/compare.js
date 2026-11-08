const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Line-based Levenshtein Distance
function calculateLineLevenshtein(linesA, linesB) {
  const m = linesA.length;
  const n = linesB.length;
  
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array(n + 1).fill(0).map((_, j) => j);
  let curr = Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      // Compare trimmed lines
      const cost = linesA[i - 1].trim() === linesB[j - 1].trim() ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,      // Deletion from A
        curr[j - 1] + 1,  // Insertion into B
        prev[j - 1] + cost // Substitution
      );
    }
    prev = [...curr];
  }
  return prev[n];
}

// Jaccard Similarity of unique, non-empty lines
function calculateJaccard(linesA, linesB) {
  const setA = new Set(linesA.map(l => l.trim()).filter(Boolean));
  const setB = new Set(linesB.map(l => l.trim()).filter(Boolean));
  
  if (setA.size === 0 && setB.size === 0) return 1.0;
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
}

// Longest Common Subsequence (LCS) to find matching lines
function getLCSAlignments(linesA, linesB) {
  const m = linesA.length;
  const n = linesB.length;
  
  // Create 2D DP array
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      // Trim and ignore empty lines when matching
      const trimA = linesA[i - 1].trim();
      const trimB = linesB[j - 1].trim();
      
      if (trimA === trimB && trimA !== '') {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const matchedA = new Set();
  const matchedB = new Set();
  
  let i = m, j = n;
  while (i > 0 && j > 0) {
    const trimA = linesA[i - 1].trim();
    const trimB = linesB[j - 1].trim();
    
    if (trimA === trimB && trimA !== '') {
      matchedA.add(i - 1);
      matchedB.add(j - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return {
    matchedA: Array.from(matchedA).reverse(),
    matchedB: Array.from(matchedB).reverse(),
    lcsLength: dp[m][n]
  };
}

// @route   POST /api/compare
// @desc    Compare code A and code B and return similarity analysis
// @access  Private (Protected)
router.post('/', auth, (req, res) => {
  const { codeA, codeB } = req.body;

  try {
    if (codeA === undefined || codeB === undefined) {
      return res.status(400).json({ message: 'Please provide codeA and codeB in request body' });
    }

    // Split code snippets into arrays of lines
    const linesA = codeA.split(/\r?\n/);
    const linesB = codeB.split(/\r?\n/);

    // Calculate metrics
    const levenshteinDist = calculateLineLevenshtein(linesA, linesB);
    const maxLines = Math.max(linesA.length, linesB.length);
    
    // Levenshtein-based similarity percentage
    const levenshteinSim = maxLines === 0 ? 1.0 : 1.0 - (levenshteinDist / maxLines);
    
    // Jaccard similarity
    const jaccardSim = calculateJaccard(linesA, linesB);
    
    // LCS line alignment
    const { matchedA, matchedB, lcsLength } = getLCSAlignments(linesA, linesB);

    // Calculate overall similarity as a weighted average or simply Levenshtein-based
    // Let's use Levenshtein-based as the primary ordering-sensitive metric,
    // but mix in Jaccard for keyword overlap
    const finalSimilarityPercent = Math.round(
      (levenshteinSim * 0.7 + jaccardSim * 0.3) * 100
    );

    res.json({
      similarity: finalSimilarityPercent, // primary similarity score (0 to 100)
      metrics: {
        levenshteinDistance: levenshteinDist,
        levenshteinSimilarity: Math.round(levenshteinSim * 100),
        jaccardSimilarity: Math.round(jaccardSim * 100),
        totalLinesA: linesA.length,
        totalLinesB: linesB.length,
        matchedLinesCount: lcsLength
      },
      matchedLinesA: matchedA, // indices of matched lines in Code A
      matchedLinesB: matchedB, // indices of matched lines in Code B
    });

  } catch (err) {
    console.error('Comparison error:', err.message);
    res.status(500).json({ message: 'Server error during code comparison' });
  }
});

module.exports = router;
