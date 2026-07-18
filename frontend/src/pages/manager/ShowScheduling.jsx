import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function ShowScheduling() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  
  // Form fields
  const [movieId, setMovieId] = useState('');
  const [theaterId, setTheaterId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch shows, movies, theaters in parallel
      const [showsRes, moviesRes, theatersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/shows`),
        fetch(`${API_BASE_URL}/movies`),
        fetch(`${API_BASE_URL}/theaters`)
      ]);

      if (!showsRes.ok || !moviesRes.ok || !theatersRes.ok) {
        throw new Error('Failed to load scheduling dependencies');
      }

      const showsData = await showsRes.json();
      const moviesData = await moviesRes.json();
      const theatersData = await theatersRes.json();

      setShows(showsData);
      setMovies(moviesData);
      setTheaters(theatersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/shows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movie: { id: parseInt(movieId) },
          theater: { id: parseInt(theaterId) },
          startTime,
          endTime,
          pricePerSeat: parseFloat(price)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create show schedule');

      setSuccess('Show scheduled successfully and seats auto-generated!');
      // Refresh shows table
      const showsRes = await fetch(`${API_BASE_URL}/shows`);
      setShows(await showsRes.json());
      
      // Reset form
      setMovieId('');
      setTheaterId('');
      setStartTime('');
      setEndTime('');
      setPrice('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this show? This will delete all seats.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/shows/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete show');

      setSuccess('Show deleted successfully');
      setShows(shows.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Show Scheduling Manager</h2>
        <p style={{ color: 'var(--text-muted)' }}>Map movies to theater rooms and configure pricing schedules.</p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          {success}
        </div>
      )}

      <div className="grid-cols-3" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Create Schedule Form */}
        <div className="glass-panel glow-cyan" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Schedule New Show</h3>
          <form onSubmit={handleCreateShow}>
            <div className="form-group">
              <label className="form-label">Select Movie</label>
              <select className="form-input" value={movieId} onChange={e => setMovieId(e.target.value)} required>
                <option value="">-- Choose Movie --</option>
                {movies.map(m => (
                  <option key={m.id} value={m.id}>{m.title} ({m.duration}m)</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Screen / Theater</label>
              <select className="form-input" value={theaterId} onChange={e => setTheaterId(e.target.value)} required>
                <option value="">-- Choose Screen --</option>
                {theaters.map(t => (
                  <option key={t.id} value={t.id}>{t.name} (Max {t.rowCount * t.colCount} seats)</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date & Time</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={startTime} 
                onChange={e => setStartTime(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date & Time</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={endTime} 
                onChange={e => setEndTime(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Seat Base Price ($)</label>
              <input 
                type="number" 
                step="0.01"
                className="form-input" 
                placeholder="15.00"
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '12px' }}>
              Schedule Show
            </button>
          </form>
        </div>

        {/* Timetable schedule list */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Current Schedules</h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading schedule data...</div>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Theater Screen</th>
                    <th>Showtime Range</th>
                    <th>Ticket Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shows.map(show => (
                    <tr key={show.id}>
                      <td style={{ fontWeight: '600' }}>{show.movie.title}</td>
                      <td>{show.theater.name}</td>
                      <td>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                          {new Date(show.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          to {new Date(show.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-accent)', fontWeight: '700' }}>
                        ${show.pricePerSeat.toFixed(2)}
                      </td>
                      <td>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleDeleteShow(show.id)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                  {shows.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                        No upcoming shows scheduled yet. Create one on the left.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
