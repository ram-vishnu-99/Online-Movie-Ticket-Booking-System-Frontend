import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api';

export default function TicketHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const currentUser = JSON.parse(userStr);

    try {
      const res = await fetch(`${API_BASE_URL}/bookings/user/${currentUser.id}`);
      if (!res.ok) throw new Error('Failed to fetch booking history');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Your Ticket History</h2>
        <p style={{ color: 'var(--text-muted)' }}>Keep track of your upcoming shows and past movie experiences.</p>
      </div>

      {loading && <div style={{ textAlign: 'center', fontSize: '1.2rem', padding: '40px' }}>Retrieving your tickets...</div>}
      {error && <div style={{ color: 'var(--color-primary)', textAlign: 'center', padding: '20px' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
          {bookings.map(booking => (
            <div 
              key={booking.id} 
              className="glass-panel" 
              style={{ 
                width: '100%', 
                maxWidth: '600px', 
                padding: 0, 
                borderRadius: '20px', 
                overflow: 'hidden', 
                border: '1px solid var(--border-color)',
                background: 'linear-gradient(145deg, #130e2b 0%, #0c0821 100%)',
                boxShadow: 'var(--glass-shadow)'
              }}
            >
              {/* Ticket Top bar */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px 24px', 
                background: 'rgba(255,255,255,0.02)', 
                borderBottom: '1px solid var(--border-color)' 
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  📅 Booked on {new Date(booking.bookingTime).toLocaleDateString()}
                </span>
                <span className="badge badge-success" style={{ letterSpacing: '1px' }}>
                  {booking.status}
                </span>
              </div>

              {/* Ticket Core Content */}
              <div style={{ display: 'flex', flexWrap: 'wrap', padding: '24px', gap: '24px' }}>
                {/* Poster image */}
                <img 
                  src={booking.show.movie.posterUrl} 
                  alt={booking.show.movie.title} 
                  style={{ width: '90px', height: '130px', objectFit: 'cover', borderRadius: '8px' }}
                />

                {/* Show Details */}
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{booking.show.movie.title}</h3>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1rem', marginBottom: '4px' }}>
                    {booking.show.theater.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    📍 {booking.show.theater.location}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--color-secondary)' }}>
                    🕒 {new Date(booking.show.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
              </div>

              {/* Dashed divider */}
              <div style={{ borderBottom: '2px dashed rgba(255,255,255,0.08)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -8, left: -8, width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-primary)' }} />
                <div style={{ position: 'absolute', top: -8, right: -8, width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-primary)' }} />
              </div>

              {/* Ticket Footer / Stub info */}
              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '24px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>SEATS</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{booking.bookedSeats}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PAID AMOUNT</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-accent)' }}>${booking.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Simulated QR Code representation */}
                <div style={{ width: '56px', height: '56px', background: 'white', borderRadius: '6px', padding: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    backgroundImage: 'radial-gradient(black 3px, transparent 4px)', 
                    backgroundSize: '10px 10px',
                    backgroundColor: 'white'
                  }} />
                </div>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '400px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎟️</div>
              <h3 style={{ marginBottom: '8px' }}>No Tickets Booked Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
                You haven't reserved any movie tickets. Browse movies to book your next cinematic adventure!
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                Find Movies
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
