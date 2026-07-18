import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api';

export default function MovieBrowse() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies`);
      if (!res.ok) throw new Error('Failed to load movies');
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie);
    try {
      const res = await fetch(`${API_BASE_URL}/shows/movie/${movie.id}`);
      if (!res.ok) throw new Error('Failed to load shows');
      const data = await res.json();
      setShows(data);
    } catch (err) {
      console.error(err);
      setShows([]);
    }
  };

  const formatShowTime = (dateTimeString) => {
    const d = new Date(dateTimeString);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Filter movies
  const genres = ['All', ...new Set(movies.map(m => m.genre?.split(' / ')[0]).filter(Boolean))];
  
  const filteredMovies = movies.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.genre?.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = genre === 'All' || m.genre?.includes(genre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Hero Banner / Headline */}
      <div className="glass-panel" style={{ marginBottom: '40px', padding: '40px', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(0, 242, 254, 0.08) 0%, rgba(26, 19, 56, 0.5) 100%)' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '12px', background: 'linear-gradient(to right, #ffffff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Experience Cinema Like Never Before
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          Search your favorite movies, pick your premium seats, and book tickets instantly in the best theaters in town.
        </p>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '700px', margin: '0 auto' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search movies by title or genre..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '240px' }}
          />
          <select 
            className="form-input" 
            value={genre} 
            onChange={e => setGenre(e.target.value)}
            style={{ width: '160px', appearance: 'none', background: 'rgba(255, 255, 255, 0.05) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 12px center', backgroundSize: '16px' }}
          >
            {genres.map(g => (
              <option key={g} value={g} style={{ backgroundColor: 'var(--bg-secondary)' }}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', fontSize: '1.2rem', padding: '40px' }}>Loading cinema movies...</div>}
      {error && <div style={{ color: 'var(--color-primary)', textAlign: 'center', padding: '20px' }}>{error}</div>}

      {/* Movies Grid */}
      {!loading && !error && (
        <div className="grid-cols-3">
          {filteredMovies.map(movie => (
            <div 
              key={movie.id} 
              className="glass-panel glow-cyan" 
              onClick={() => handleMovieClick(movie)}
              style={{ cursor: 'pointer', padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', width: '100%', paddingBottom: '140%', marginBottom: '16px' }}>
                <img 
                  src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500'} 
                  alt={movie.title} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>{movie.title}</h3>
              <p style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>{movie.genre}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {movie.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>⏱️ {movie.duration} mins</span>
                <span>🗣️ {movie.language}</span>
              </div>
            </div>
          ))}
          {filteredMovies.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              No movies found matching your query.
            </div>
          )}
        </div>
      )}

      {/* Showtimes Drawer / Modal */}
      {selectedMovie && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zindex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setSelectedMovie(null)} 
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
              <img 
                src={selectedMovie.posterUrl} 
                alt={selectedMovie.title} 
                style={{ width: '100px', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{selectedMovie.title}</h2>
                <span className="badge badge-primary" style={{ marginBottom: '8px' }}>{selectedMovie.genre}</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Duration: {selectedMovie.duration} mins</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Language: {selectedMovie.language}</p>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Select a Showtime
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {shows.map(show => (
                <div 
                  key={show.id} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', hover: { borderColor: 'var(--color-secondary)' } }}
                >
                  <div>
                    <h4 style={{ fontWeight: '600' }}>{show.theater.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {show.theater.location}</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', marginTop: '4px', fontWeight: '500' }}>
                      🕒 {formatShowTime(show.startTime)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-accent)', marginBottom: '8px' }}>
                      ${show.pricePerSeat.toFixed(2)}
                    </div>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setSelectedMovie(null);
                        const userStr = localStorage.getItem('user');
                        if (!userStr) {
                          navigate('/login');
                        } else {
                          navigate(`/book-show/${show.id}`);
                        }
                      }}
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    >
                      Book Seats
                    </button>
                  </div>
                </div>
              ))}
              {shows.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                  No active shows scheduled for this movie. Check back later!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
