import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function MovieManagement() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [duration, setDuration] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/movies`);
      if (!res.ok) throw new Error('Failed to fetch movies');
      setMovies(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movie) => {
    setEditingId(movie.id);
    setTitle(movie.title);
    setDescription(movie.description || '');
    setGenre(movie.genre || '');
    setLanguage(movie.language || '');
    setDuration(movie.duration || '');
    setReleaseDate(movie.releaseDate || '');
    setPosterUrl(movie.posterUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setGenre('');
    setLanguage('');
    setDuration('');
    setReleaseDate('');
    setPosterUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      title,
      description,
      genre,
      language,
      duration: parseInt(duration),
      releaseDate,
      posterUrl
    };

    try {
      let res;
      if (editingId) {
        // Update
        res = await fetch(`${API_BASE_URL}/movies/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create
        res = await fetch(`${API_BASE_URL}/movies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      setSuccess(editingId ? 'Movie updated successfully!' : 'Movie added successfully!');
      handleCancelEdit();
      fetchMovies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie? This may affect scheduled shows.')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/movies/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete movie');

      setSuccess('Movie deleted successfully');
      setMovies(movies.filter(m => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Movie Management Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>Admin dashboard to insert, update, or remove movies from catalog listings.</p>
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
        {/* Form panel */}
        <div className="glass-panel glow-pink" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
            {editingId ? 'Edit Movie Details' : 'Add New Movie'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Movie Title</label>
              <input 
                type="text" 
                className="form-input" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                placeholder="Inception"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Genre</label>
              <input 
                type="text" 
                className="form-input" 
                value={genre} 
                onChange={e => setGenre(e.target.value)} 
                required 
                placeholder="Sci-Fi / Thriller"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Language</label>
              <input 
                type="text" 
                className="form-input" 
                value={language} 
                onChange={e => setLanguage(e.target.value)} 
                required 
                placeholder="English"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input 
                type="number" 
                className="form-input" 
                value={duration} 
                onChange={e => setDuration(e.target.value)} 
                required 
                placeholder="148"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Release Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={releaseDate} 
                onChange={e => setReleaseDate(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Poster Image URL</label>
              <input 
                type="url" 
                className="form-input" 
                value={posterUrl} 
                onChange={e => setPosterUrl(e.target.value)} 
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Synopsis (Description)</label>
              <textarea 
                className="form-input" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows="3"
                placeholder="Brief movie outline..."
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingId ? 'Save Changes' : 'Add Movie'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List table panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Movie Catalog</h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Fetching movie records...</div>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Title & Genre</th>
                    <th>Specs</th>
                    <th>Release</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map(movie => (
                    <tr key={movie.id}>
                      <td>
                        <img 
                          src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500'} 
                          alt={movie.title} 
                          style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{movie.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>{movie.genre}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>⏱️ {movie.duration} mins</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🗣️ {movie.language}</div>
                      </td>
                      <td style={{ fontSize: '0.9rem' }}>{movie.releaseDate}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-outline" 
                            onClick={() => handleEdit(movie)}
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--border-color)' }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-outline" 
                            onClick={() => handleDelete(movie.id)}
                            style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {movies.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                        No movies found in the database. Enter a record on the left.
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
