import React, { useState, useEffect } from 'react';

export default function UserProfile({ user, token, backendUrl, onUpdateUser, onLoadSubmission, setActiveTab }) {
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills ? user.skills.join(', ') : '');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [historyError, setHistoryError] = useState('');

  // Fetch submissions history
  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const response = await fetch(`${backendUrl}/api/submissions/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load past comparisons.');
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token, backendUrl]);

  // Handle Profile Update Submit
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    setUpdateLoading(true);

    try {
      const parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);

      const response = await fetch(`${backendUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio,
          skills: parsedSkills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed.');
      }

      setUpdateSuccess('Profile updated successfully!');
      // Update global user state
      onUpdateUser(data);
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Trigger loading submission back to compare tool
  const handleLoadPastCompare = (sub) => {
    onLoadSubmission(sub);
    setActiveTab('compare');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Profile Card (Left Column) */}
      <div className="lg:col-span-1">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 sticky top-28">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-slate-950 font-bold text-3xl mb-4 shadow-xl shadow-emerald-500/10">
              {user?.username.substring(0, 2).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white">@{user?.username}</h2>
            <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
          </div>

          {updateError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold">
              ⚠️ {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              ✅ {updateSuccess}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio / Description</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself, your favorite language, or coding credentials..."
                rows="3"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills (Comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, C++, Python, Cyber"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={updateLoading}
              className="w-full py-2.5 rounded-xl font-bold bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/50 text-slate-300 hover:text-emerald-400 transition-all duration-200 text-xs flex items-center justify-center gap-2"
            >
              {updateLoading ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>

          {/* Render Skills Badges */}
          {user?.skills && user.skills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-900/60">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Skills Badges</span>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-bold bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submission History (Right Columns) */}
      <div className="lg:col-span-2">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
            Comparison <span className="text-emerald-400 neon-glow-green">History</span>
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Review your past code comparisons, checks, and similarity scores. Click any card to load it in the comparer.
          </p>

          {historyLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 mt-4 text-xs font-medium">Fetching history...</p>
            </div>
          ) : historyError ? (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/10 text-red-400 text-sm">
              ⚠️ {historyError}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/10 rounded-2xl border border-dashed border-slate-800/80">
              <span className="text-3xl">💻</span>
              <p className="text-slate-500 text-sm font-semibold mt-3">You haven't saved any code comparisons yet.</p>
              <button
                onClick={() => setActiveTab('compare')}
                className="mt-4 px-4 py-2 rounded-xl text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold"
              >
                Compare Code Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((sub) => {
                const isHigh = sub.similarity >= 70;
                const isMid = sub.similarity >= 40 && sub.similarity < 70;
                
                const badgeColor = 
                  isHigh ? 'text-red-400 bg-red-500/5 border-red-500/20' :
                  isMid ? 'text-amber-400 bg-amber-500/5 border-amber-500/20' :
                  'text-green-400 bg-green-500/5 border-green-500/20';

                const similarityText = 
                  isHigh ? 'High Overlap' :
                  isMid ? 'Moderate Overlap' :
                  'Low/No Overlap';

                return (
                  <div
                    key={sub._id}
                    onClick={() => handleLoadPastCompare(sub)}
                    className="glass-card rounded-xl p-5 border border-slate-900 hover:border-slate-800 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-base font-bold text-white">{sub.title}</span>
                        <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${badgeColor}`}>
                          {sub.similarity}% - {similarityText}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-500 font-semibold space-x-4">
                        <span>📅 {new Date(sub.createdAt).toLocaleString()}</span>
                        <span>📏 Lines: {sub.codeA.split('\n').length} vs {sub.codeB.split('\n').length}</span>
                      </div>

                      {/* Summary Metrics */}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          Levenshtein Distance: {sub.levenshteinDistance}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          Jaccard Similarity: {sub.jaccardSimilarity}%
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          Matches: {sub.matchedLinesCount} lines
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center self-end md:self-auto text-xs text-emerald-400 font-bold gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Load in Editor</span>
                      <span>➡️</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
