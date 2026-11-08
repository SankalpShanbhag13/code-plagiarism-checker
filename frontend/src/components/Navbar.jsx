import React from 'react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 transition-all duration-300 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setActiveTab('compare')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <span className="text-xl font-bold text-slate-950">⚡</span>
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">Code<span className="text-emerald-400 neon-glow-green">Align</span></span>
            <span className="block text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Similarity Engine</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'compare'
                ? 'bg-slate-800 text-emerald-400 font-semibold border-b border-emerald-500'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Code Comparison
          </button>
          
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'events'
                ? 'bg-slate-800 text-emerald-400 font-semibold border-b border-emerald-500'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Hackathon Events
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-slate-800 text-emerald-400 font-semibold border-b border-emerald-500'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              My Dashboard
            </button>
          )}
        </div>

        {/* User Account Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Logged In</span>
                <span className="text-sm font-bold text-white hover:text-emerald-400 transition-colors duration-200 cursor-pointer" onClick={() => setActiveTab('profile')}>
                  @{user.username}
                </span>
              </div>
              <div 
                className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold cursor-pointer hover:border-emerald-500 transition-all duration-200"
                onClick={() => setActiveTab('profile')}
              >
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('auth')}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-300 font-bold"
              >
                Authenticate Account
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
