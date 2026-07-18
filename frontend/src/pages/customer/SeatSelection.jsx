import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api';

export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Checkout flow
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedTicket, setBookedTicket] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchShowAndSeats();
  }, [showId]);

  const fetchShowAndSeats = async () => {
    try {
      setLoading(true);
      // 1. Fetch Show Details
      const showRes = await fetch(`${API_BASE_URL}/shows/${showId}`);
      if (!showRes.ok) throw new Error('Show details not found');
      const showData = await showRes.json();
      setShow(showData);

      // 2. Fetch Show Seats
      const seatsRes = await fetch(`${API_BASE_URL}/shows/${showId}/seats`);
      if (!seatsRes.ok) throw new Error('Failed to load seats layout');
      const seatsData = await seatsRes.json();
      setSeats(seatsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return; // Can't select already booked seats
    
    const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);
    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBookTickets = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const currentUser = JSON.parse(userStr);

    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          showId: parseInt(showId),
          seatIds: selectedSeats.map(s => s.id)
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');

      setBookedTicket(data);
      setBookingSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Group seats by row
  const seatsByRow = seats.reduce((groups, seat) => {
    const row = seat.rowName;
    if (!groups[row]) groups[row] = [];
    groups[row].push(seat);
    return groups;
  }, {});

  // Sort seats in each row by seat number
  Object.keys(seatsByRow).forEach(row => {
    seatsByRow[row].sort((a, b) => a.seatNumber - b.seatNumber);
  });

  // Sort rows alphabetically
  const sortedRows = Object.keys(seatsByRow).sort();

  const totalCost = selectedSeats.length * (show?.pricePerSeat || 0);

  if (loading) return <div style={{ textAlign: 'center', fontSize: '1.2rem', padding: '40px' }}>Loading theater layout...</div>;
  if (error && !bookingSuccess) return <div style={{ color: 'var(--color-primary)', textAlign: 'center', padding: '20px' }}>{error}</div>;

  return (
    <div style={{ padding: '20px 0' }}>
      {!bookingSuccess ? (
        <div className="grid-cols-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
          {/* Seat Layout Panel */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ marginBottom: '8px', fontSize: '1.6rem' }}>Select Your Seats</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '40px' }}>
              {show?.theater.name} — {show?.movie.title}
            </p>

            {/* Screen Visualization */}
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '48px' }}>
              <div style={{
                width: '100%',
                height: '12px',
                background: 'linear-gradient(to right, transparent, var(--color-secondary), transparent)',
                borderRadius: '50%',
                boxShadow: '0 4px 20px var(--color-secondary)',
                marginBottom: '8px'
              }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: '600' }}>
                Screen (Front)
              </div>
            </div>

            {/* Grid Seats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', overflowX: 'auto', paddingBottom: '16px' }}>
              {sortedRows.map(row => (
                <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                  {/* Row Letter label (Left) */}
                  <span style={{ fontWeight: '700', color: 'var(--text-muted)', width: '20px', textAlign: 'center' }}>{row}</span>
                  
                  {/* Row seats */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {seatsByRow[row].map(seat => {
                      const isSelected = selectedSeats.some(s => s.id === seat.id);
                      let seatBg = 'rgba(255, 255, 255, 0.05)';
                      let seatBorder = '1px solid var(--border-color)';
                      let cursorType = 'pointer';

                      if (seat.isBooked) {
                        seatBg = 'rgba(239, 68, 68, 0.15)';
                        seatBorder = '1px solid rgba(239, 68, 68, 0.3)';
                        cursorType = 'not-allowed';
                      } else if (isSelected) {
                        seatBg = 'var(--color-secondary)';
                        seatBorder = '1px solid var(--color-secondary)';
                      }

                      return (
                        <div
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          title={`${row}${seat.seatNumber} (${seat.isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'})`}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: seatBg,
                            border: seatBorder,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: seat.isBooked ? '#ef4444' : isSelected ? '#0b071e' : 'var(--text-main)',
                            cursor: cursorType,
                            transition: 'var(--transition-smooth)',
                            boxShadow: isSelected ? '0 0 10px rgba(0, 242, 254, 0.5)' : 'none'
                          }}
                        >
                          {seat.isBooked ? '✕' : seat.seatNumber}
                        </div>
                      );
                    })}
                  </div>

                  {/* Row Letter label (Right) */}
                  <span style={{ fontWeight: '700', color: 'var(--text-muted)', width: '20px', textAlign: 'center' }}>{row}</span>
                </div>
              ))}
            </div>

            {/* Seat Map Legend */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '32px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)' }} />
                <span>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--color-secondary)', boxShadow: '0 0 10px rgba(0, 242, 254, 0.5)' }} />
                <span>Selected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#ef4444' }}>✕</div>
                <span>Occupied</span>
              </div>
            </div>
          </div>

          {/* Ticket Booking Checkout Sidebar */}
          <div className="glass-panel glow-pink" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Booking Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Movie</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{show?.movie.title}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Theater & Screen</span>
                <div style={{ fontSize: '1rem', fontWeight: '500' }}>{show?.theater.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {show?.theater.location}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showtime</span>
                <div style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--color-secondary)' }}>
                  {show && new Date(show.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seats Selected</span>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-primary)', minHeight: '24px' }}>
                  {selectedSeats.length > 0 
                    ? selectedSeats.map(s => `${s.rowName}${s.seatNumber}`).join(', ') 
                    : 'None selected'
                  }
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price per ticket</span>
                <div style={{ fontWeight: '500' }}>${show?.pricePerSeat.toFixed(2)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Amount</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-accent)' }}>
                  ${totalCost.toFixed(2)}
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              disabled={selectedSeats.length === 0 || isProcessing}
              onClick={handleBookTickets}
              style={{ width: '100%' }}
            >
              {isProcessing ? 'Processing Transaction...' : `Book ${selectedSeats.length} Ticket(s)`}
            </button>
          </div>
        </div>
      ) : (
        /* Confirmed Ticket Receipt styling (Physical lookalike card) */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', padding: '40px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--color-success)', margin: '0 auto 16px auto', border: '2px solid var(--color-success)' }}>✓</div>
            <h2 style={{ fontSize: '2rem' }}>Booking Confirmed!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Your physical e-ticket has been generated below.</p>
          </div>

          {/* High Fidelity Ticket Layout */}
          <div className="glass-panel" style={{ 
            width: '100%', 
            maxWidth: '500px', 
            padding: 0, 
            borderRadius: '24px', 
            overflow: 'hidden', 
            border: '2px solid var(--color-secondary)',
            boxShadow: '0 0 30px rgba(0, 242, 254, 0.15)',
            background: 'linear-gradient(145deg, #16112e 0%, #0b071e 100%)'
          }}>
            {/* Ticket Header */}
            <div style={{ background: 'linear-gradient(to right, var(--color-primary), #9f1239)', padding: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '2px' }}>Boarding Ticket</span>
                <h3 style={{ fontSize: '1.6rem', marginTop: '4px' }}>{show?.movie.title}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Gate Open</span>
                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>20 min prior</div>
              </div>
            </div>

            {/* Ticket Details Body */}
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', borderBottom: '2px dashed rgba(255, 255, 255, 0.1)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>THEATER</span>
                <div style={{ fontWeight: '600' }}>{show?.theater.name}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LOCATION</span>
                <div style={{ fontWeight: '500' }}>{show?.theater.location}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DATE & TIME</span>
                <div style={{ fontWeight: '600', color: 'var(--color-secondary)' }}>
                  {show && new Date(show.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SEATS</span>
                <div style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{bookedTicket?.bookedSeats}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORDER NUMBER</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>#MBS-T{bookedTicket?.id}02{show?.id}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL PAID</span>
                <div style={{ fontWeight: '700', color: 'var(--color-accent)', fontSize: '1.2rem' }}>${bookedTicket?.totalAmount.toFixed(2)}</div>
              </div>
            </div>

            {/* Ticket Stub Footer (QR Code area) */}
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.01)' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-main)' }}>Scan for Admission</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Show this barcode at the screen entrance.</div>
              </div>
              {/* Simulated QR Code using CSS Grid */}
              <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '8px', padding: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundImage: 'radial-gradient(black 3px, transparent 4px), radial-gradient(black 3px, transparent 4px)', 
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0, 6px 6px',
                  backgroundColor: 'white'
                }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              Browse Movies
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/history')}>
              View Ticket History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
