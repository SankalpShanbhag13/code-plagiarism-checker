import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import CodeComparer from './components/CodeComparer';
import EventDashboard from './components/EventDashboard';
import UserProfile from './components/UserProfile';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default function App() {
  const [activeTab, setActiveTab] = useState('compare');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loadedSubmission, setLoadedSubmission] = useState(null);

  // Load auth state from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        // Clear corrupt data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Handle successful login/registration
  const handleAuthSuccess = (authUser, authToken) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    
    // Redirect to comparison engine automatically
    setActiveTab('compare');
  };

  // Handle user logout
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setActiveTab('compare');
  };

  // Handle profile details update
  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Handle loading past comparison back in comparative view
  const handleLoadSubmission = (submission) => {
    setLoadedSubmission(submission);
    setActiveTab('compare');
  };

  const clearLoadedSubmission = () => {
    setLoadedSubmission(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 w-full relative">
        {/* Glow decoration underlay */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pulse-glow"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pulse-glow"></div>

        {activeTab === 'compare' && (
          <CodeComparer 
            user={user} 
            token={token} 
            backendUrl={BACKEND_URL}
            loadedSubmission={loadedSubmission}
            clearLoadedSubmission={clearLoadedSubmission}
          />
        )}

        {activeTab === 'events' && (
          <EventDashboard 
            user={user} 
            token={token} 
            backendUrl={BACKEND_URL} 
          />
        )}

        {activeTab === 'profile' && user ? (
          <UserProfile 
            user={user} 
            token={token} 
            backendUrl={BACKEND_URL} 
            onUpdateUser={handleUpdateUser}
            onLoadSubmission={handleLoadSubmission}
            setActiveTab={setActiveTab}
          />
        ) : activeTab === 'profile' ? (
          <div className="text-center py-24 max-w-md mx-auto">
            <span className="text-4xl">🔒</span>
            <h2 className="text-2xl font-bold mt-4 text-white">Dashboard Locked</h2>
            <p className="text-slate-400 mt-2 text-sm">Please log in to view your profile dashboard and submission history.</p>
            <button
              onClick={() => setActiveTab('auth')}
              className="mt-6 px-5 py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 shadow-lg shadow-emerald-500/10 font-bold"
            >
              Sign In Now
            </button>
          </div>
        ) : null}

        {activeTab === 'auth' && (
          <Auth 
            onAuthSuccess={handleAuthSuccess} 
            backendUrl={BACKEND_URL} 
          />
        )}
      </main>

      {/* Modern footer */}
      <footer className="glass-panel py-6 border-t border-slate-900 mt-auto text-center text-xs font-semibold text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} CodeAlign ⚡ All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
