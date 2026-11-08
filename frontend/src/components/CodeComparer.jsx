import React, { useState, useEffect } from 'react';

export default function CodeComparer({ user, token, backendUrl, loadedSubmission, clearLoadedSubmission }) {
  const [title, setTitle] = useState('');
  const [codeA, setCodeA] = useState('');
  const [codeB, setCodeB] = useState('');
  
  const [comparing, setComparing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Results State
  const [results, setResults] = useState(null);

  // If a submission is loaded from profile history, populate it
  useEffect(() => {
    if (loadedSubmission) {
      setTitle(loadedSubmission.title || '');
      setCodeA(loadedSubmission.codeA || '');
      setCodeB(loadedSubmission.codeB || '');
      
      // Setup mock results using stored submission data
      setResults({
        similarity: loadedSubmission.similarity,
        metrics: {
          levenshteinDistance: loadedSubmission.levenshteinDistance,
          jaccardSimilarity: loadedSubmission.jaccardSimilarity,
          matchedLinesCount: loadedSubmission.matchedLinesCount,
          totalLinesA: loadedSubmission.codeA.split('\n').length,
          totalLinesB: loadedSubmission.codeB.split('\n').length,
        },
        matchedLinesA: loadedSubmission.matchedLinesA || [],
        matchedLinesB: loadedSubmission.matchedLinesB || [],
      });

      // Clear the loaded request so they can edit it
      clearLoadedSubmission();
    }
  }, [loadedSubmission]);

  // Run Similarity Comparison API
  const handleCompare = async () => {
    setError('');
    setSaveSuccess('');
    
    if (!codeA.trim() || !codeB.trim()) {
      setError('Please paste code into both input editors before comparing.');
      return;
    }

    setComparing(true);
    setResults(null);

    try {
      const response = await fetch(`${backendUrl}/api/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`, // Pass token if logged in
        },
        body: JSON.stringify({ codeA, codeB }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Comparison failed.');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setComparing(false);
    }
  };

  // Save Comparison API
  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!results) return;

    setSaving(true);
    setError('');
    setSaveSuccess('');

    try {
      const payload = {
        title: title.trim() || 'Untitled Comparison',
        codeA,
        codeB,
        similarity: results.similarity,
        jaccardSimilarity: results.metrics.jaccardSimilarity,
        levenshteinDistance: results.metrics.levenshteinDistance,
        matchedLinesCount: results.metrics.matchedLinesCount,
        matchedLinesA: results.matchedLinesA,
        matchedLinesB: results.matchedLinesB,
      };

      const response = await fetch(`${backendUrl}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save submission.');
      }

      setSaveSuccess('Comparison saved successfully to history!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Load sample code to make testing easy
  const loadSample = () => {
    setTitle('Python Prime Check Comparison');
    setCodeA(`def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True`);
    
    setCodeB(`def check_if_prime(num):
    # Check if number is prime
    if num <= 1:
        return False
    for val in range(2, int(num ** 0.5) + 1):
        if num % val == 0:
            return False
    return True`);
    setResults(null);
    setError('');
    setSaveSuccess('');
  };

  // Clear inputs
  const handleClear = () => {
    setTitle('');
    setCodeA('');
    setCodeB('');
    setResults(null);
    setError('');
    setSaveSuccess('');
  };

  // Render Highlighted Code Blocks
  const renderHighlightedView = () => {
    if (!results) return null;

    const linesA = codeA.split(/\r?\n/);
    const linesB = codeB.split(/\r?\n/);

    const maxLineCount = Math.max(linesA.length, linesB.length);
    const matchedASet = new Set(results.matchedLinesA);
    const matchedBSet = new Set(results.matchedLinesB);

    return (
      <div className="mt-8 border border-slate-800/80 rounded-2xl overflow-hidden bg-[#0d1117] relative">
        <div className="glass-panel px-6 py-4 flex items-center justify-between border-b border-slate-900">
          <span className="text-sm font-bold text-slate-300">Side-by-Side Highlighted Comparison</span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500/25 border-l-2 border-emerald-500 inline-block"></span> Matched Line</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-900 border-l-2 border-transparent inline-block"></span> Different Line</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-900 text-xs font-mono select-text overflow-x-auto">
          {/* Code A Highlight Panel */}
          <div className="p-4 overflow-x-auto bg-[#0d1117]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 select-none flex justify-between">
              <span>Code Snippet A</span>
              <span>Lines: {linesA.length}</span>
            </div>
            
            <div className="min-w-full">
              {linesA.map((line, idx) => {
                const isMatched = matchedASet.has(idx);
                return (
                  <div
                    key={idx}
                    className={`flex items-start py-0.5 leading-5 w-full ${
                      isMatched ? 'code-line-matched' : 'code-line-normal'
                    }`}
                  >
                    <span className="w-10 text-slate-600 text-right pr-3 select-none font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300 whitespace-pre flex-1 pl-2">
                      {line === '' ? ' ' : line}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Code B Highlight Panel */}
          <div className="p-4 overflow-x-auto bg-[#0d1117]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 select-none flex justify-between">
              <span>Code Snippet B</span>
              <span>Lines: {linesB.length}</span>
            </div>

            <div className="min-w-full">
              {linesB.map((line, idx) => {
                const isMatched = matchedBSet.has(idx);
                return (
                  <div
                    key={idx}
                    className={`flex items-start py-0.5 leading-5 w-full ${
                      isMatched ? 'code-line-matched' : 'code-line-normal'
                    }`}
                  >
                    <span className="w-10 text-slate-600 text-right pr-3 select-none font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300 whitespace-pre flex-1 pl-2">
                      {line === '' ? ' ' : line}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Code Similarity <span className="text-emerald-400 neon-glow-green">Comparer</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Analyze code patterns, logic duplication, and syntax integrity using custom line alignment algorithms.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadSample}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            💡 Load Sample
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            🗑️ Clear Editors
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <span>✅</span> {saveSuccess}
        </div>
      )}

      {/* Editor grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Editor A */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Code Editor A
            </span>
          </div>

          <textarea
            value={codeA}
            onChange={(e) => setCodeA(e.target.value)}
            placeholder="// Paste or type your code here... (Code A)"
            rows="14"
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-900 text-slate-300 font-mono text-xs placeholder-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-y leading-relaxed"
          ></textarea>
        </div>

        {/* Editor B */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Code Editor B
            </span>
          </div>

          <textarea
            value={codeB}
            onChange={(e) => setCodeB(e.target.value)}
            placeholder="// Paste or type your code here... (Code B)"
            rows="14"
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-900 text-slate-300 font-mono text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all resize-y leading-relaxed"
          ></textarea>
        </div>

      </div>

      {/* Action Control Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleCompare}
          disabled={comparing}
          className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.01] active:scale-95 transition-all duration-300 text-sm flex items-center gap-2"
        >
          {comparing ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing Code Patterns...</span>
            </>
          ) : (
            <>
              <span>⚡ Run Similarity Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Comparison Results Card */}
      {results && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Similarity Meter Card */}
          <div className="glass-panel lg:col-span-1 rounded-2xl p-6 border border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl"></div>
            
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Overall Similarity</span>
            
            {/* Visual Ring Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  strokeWidth="8"
                  stroke="rgba(30, 41, 59, 0.6)"
                  fill="transparent"
                />
                {/* Foreground Fill */}
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  strokeWidth="8"
                  stroke={results.similarity >= 70 ? '#ef4444' : results.similarity >= 40 ? '#f59e0b' : '#10b981'}
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - results.similarity / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-white">{results.similarity}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Overlap</span>
              </div>
            </div>

            <div className="text-center">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                results.similarity >= 70 ? 'text-red-400 bg-red-500/10' :
                results.similarity >= 40 ? 'text-amber-400 bg-amber-500/10' :
                'text-green-400 bg-green-500/10'
              }`}>
                {results.similarity >= 70 ? 'High Duplication Threat' :
                 results.similarity >= 40 ? 'Moderate Duplication' :
                 'Safe / Unique'}
              </span>
            </div>
          </div>

          {/* Stats & Metadata Details */}
          <div className="glass-panel lg:col-span-2 rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">Engine Core Metrics</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Levenshtein Dist</span>
                  <span className="text-lg font-bold text-white">{results.metrics.levenshteinDistance}</span>
                  <span className="block text-[9px] text-slate-400 font-semibold mt-1">line-edits required</span>
                </div>
                
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jaccard Index</span>
                  <span className="text-lg font-bold text-white">{results.metrics.jaccardSimilarity}%</span>
                  <span className="block text-[9px] text-slate-400 font-semibold mt-1">unique line overlap</span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Aligned Matches</span>
                  <span className="text-lg font-bold text-emerald-400 neon-glow-green">{results.metrics.matchedLinesCount}</span>
                  <span className="block text-[9px] text-slate-400 font-semibold mt-1">LCS matching lines</span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Checked</span>
                  <span className="text-lg font-bold text-white">{results.metrics.totalLinesA} : {results.metrics.totalLinesB}</span>
                  <span className="block text-[9px] text-slate-400 font-semibold mt-1">lines per file</span>
                </div>
              </div>
            </div>

            {/* Save Form Section */}
            <div className="border-t border-slate-900/60 pt-5 mt-5">
              {user ? (
                <form onSubmit={handleSaveResult} className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Save Results Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Check for Round 1 Code Submission"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-slate-300 placeholder-slate-700 focus:outline-none focus:border-emerald-500/50 text-xs font-semibold"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 flex items-center justify-center gap-1.5"
                  >
                    {saving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>💾 Save Comparison</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-2 bg-slate-900/30 rounded-xl border border-slate-900 flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold">
                  <span>💡</span> Log in to save this comparison metrics history to your Dashboard account.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Render Aligned Highlighting */}
      {renderHighlightedView()}

    </div>
  );
}
