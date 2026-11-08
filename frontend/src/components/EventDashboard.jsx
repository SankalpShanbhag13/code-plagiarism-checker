import React, { useState, useEffect } from 'react';

export default function EventDashboard({ user, token, backendUrl }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // Form State (For Create / Edit)
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null); // null means creating, ID means editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [location, setLocation] = useState('Virtual');
  const [tagsInput, setTagsInput] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch all events on load
  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${backendUrl}/api/events`);
      if (!response.ok) {
        throw new Error('Failed to load events.');
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [backendUrl]);

  // Handle Event Submit (Create or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title || !description || !date || !difficulty) {
      setFormError('Please enter all required fields.');
      return;
    }

    const payload = {
      title,
      description,
      date,
      difficulty,
      location,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      const url = editingEventId 
        ? `${backendUrl}/api/events/${editingEventId}`
        : `${backendUrl}/api/events`;
        
      const method = editingEventId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      setFormSuccess(editingEventId ? 'Event updated successfully!' : 'Event created successfully!');
      
      // Reset form
      setTimeout(() => {
        setShowForm(false);
        setEditingEventId(null);
        setTitle('');
        setDescription('');
        setDate('');
        setDifficulty('Beginner');
        setLocation('Virtual');
        setTagsInput('');
        setFormSuccess('');
        fetchEvents();
      }, 1000);

    } catch (err) {
      setFormError(err.message);
    }
  };

  // Open edit form
  const handleEditClick = (event) => {
    setEditingEventId(event._id);
    setTitle(event.title);
    setDescription(event.description);
    // Format date string to YYYY-MM-DD for html input
    const formattedDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
    setDate(formattedDate);
    setDifficulty(event.difficulty);
    setLocation(event.location);
    setTagsInput(event.tags ? event.tags.join(', ') : '');
    setShowForm(true);
  };

  // Handle Event Delete
  const handleDeleteClick = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`${backendUrl}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter events
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase()) ||
      (evt.tags && evt.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesDifficulty =
      difficultyFilter === 'All' || evt.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Hackathons & <span className="text-emerald-400 neon-glow-green">Events</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Browse, filter, and schedule developer challenges or create your own custom coding sprints.
          </p>
        </div>

        {user && (
          <button
            onClick={() => {
              setEditingEventId(null);
              setShowForm(!showForm);
            }}
            className="self-start md:self-auto px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300"
          >
            {showForm ? 'Close Form' : '🚀 Create Event'}
          </button>
        )}
      </div>

      {/* Form (Modal/Drawer style) */}
      {showForm && (
        <div className="glass-panel rounded-2xl p-6 mb-8 border border-emerald-500/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          
          <h2 className="text-xl font-extrabold text-white mb-4">
            {editingEventId ? '🔧 Modify Coding Event' : '📝 Sponsor New Hackathon'}
          </h2>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold">
              ⚠️ {formError}
            </div>
          )}
          {formSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              ✅ {formSuccess}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Speedcoding Challenge"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Difficulty Level *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the event, timelines, rules, languages allowed..."
                rows="3"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Scheduled Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location / Platform</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Virtual (Discord) or Office Address"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g., Algorithms, Python, Solidity, Web"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingEventId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
              >
                {editingEventId ? 'Apply Changes' : 'Publish Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Filters Bar */}
      <div className="glass-card rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, details, tags..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-sm font-medium"
          />
          <span className="absolute right-4 top-3 text-slate-600">🔍</span>
        </div>

        <div className="flex items-center gap-2 md:col-span-2 justify-end">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Difficulty:</span>
          <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  difficultyFilter === diff
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 mt-4 text-xs font-semibold">Loading hackathons...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-slate-900/20 rounded-2xl border border-red-500/10">
          <span className="text-2xl">⚠️</span>
          <p className="text-red-400 text-sm font-semibold mt-2">{error}</p>
          <button 
            onClick={fetchEvents}
            className="mt-4 px-4 py-2 rounded-xl text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
          >
            Retry
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/15 rounded-2xl border border-slate-900">
          <span className="text-3xl">🧩</span>
          <p className="text-slate-500 text-sm font-semibold mt-3">No coding events match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const diffColor = 
              evt.difficulty === 'Beginner' ? 'text-green-400 bg-green-500/5 border-green-500/20' :
              evt.difficulty === 'Intermediate' ? 'text-amber-400 bg-amber-500/5 border-amber-500/20' :
              'text-red-400 bg-red-500/5 border-red-500/20';

            const isOrganizer = user && evt.organizer && (evt.organizer._id === user.id || evt.organizer === user.id);

            return (
              <div key={evt._id} className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
                {/* Difficulty badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border ${diffColor}`}>
                    {evt.difficulty}
                  </span>
                  
                  <span className="text-xs text-slate-500 font-medium">
                    📅 {new Date(evt.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors duration-200">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                {/* Location and organizer info */}
                <div className="border-t border-slate-900/60 pt-4 mt-auto">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-3">
                    <span>📍 {evt.location}</span>
                    <span>👤 {evt.organizer?.username || 'Hackathon Host'}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {evt.tags && evt.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800/60">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Organizer actions */}
                  {isOrganizer && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900/40">
                      <button
                        onClick={() => handleEditClick(evt)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(evt._id)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-900 border border-slate-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
