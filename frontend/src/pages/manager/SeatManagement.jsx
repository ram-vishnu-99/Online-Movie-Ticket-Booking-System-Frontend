import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function SeatManagement() {
  const [shows, setShows] = useState([]);
  const [selectedShowId, setSelectedShowId] = useState('');
  const [showDetails, setShowDetails] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/shows`);
      if (!res.ok) throw new Error('Failed to load shows list');
      setShows(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShowSelect = async (showId) => {
    setSelectedShowId(showId);
    if (!showId) {
      setShowDetails(null);
      setSeats([]);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Find selected show details in local shows list
      const details = shows.find(s => s.id === parseInt(showId));
      setShowDetails(details);

      // Fetch seat grid details for this show
      const res = await fetch(`${API_BASE_URL}/shows/${showId}/seats`);
      if (!res.ok) throw new Error('Failed to load seat configurations');
      const seatsData = await res.json();
      setSeats(seatsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group seats by row for layout rendering
  const seatsByRow = seats.reduce((groups, seat) => {
    const row = seat.rowName;
    if (!groups[row]) groups[row] = [];
    groups[row].push(seat);
    return groups;
  }, {});

  // Sort seats in each row
  Object.keys(seatsByRow).forEach(row => {
    seatsByRow[row].sort((a, b) => a.seatNumber - b.seatNumber);
  });

  const sortedRows = Object.keys(seatsByRow).sort();

  // Statistics
  const totalSeatsCount = seats.length;
  const bookedSeatsCount = seats.filter(s => s.isBooked).length;
  const availableSeatsCount = totalSeatsCount - bookedSeatsCount;
  const occupancyRate = totalSeatsCount > 0 ? ((bookedSeatsCount / totalSeatsCount) * 100) : 0;
  const revenueGenerated = bookedSeatsCount * (showDetails?.pricePerSeat || 0);

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Theater Seat Layout Management</h2>
        <p style={{ color: 'var(--text-muted)' }}>Inspect seating occupancy graphs and operational performance per screening.</p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          {error}
        </div>
      )}

      {/* Select active show controller */}
      <div className="glass-panel" style={{ marginBottom: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label className="form-label">Select Scheduled Show</label>
          <select 
            className="form-input" 
            value={selectedShowId} 
            onChange={e => handleShowSelect(e.target.value)}
            style={{ appearance: 'none', background: 'rgba(255, 255, 255, 0.05) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 12px center', backgroundSize: '16px' }}
          >
            <option value="">-- Choose a Scheduled Show --</option>
            {shows.map(s => (
              <option key={s.id} value={s.id}>
                {s.movie.title} at {s.theater.name} ({new Date(s.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedShowId && showDetails && (
        <div className="grid-cols-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
          {/* Seat Layout View */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ marginBottom: '24px' }}>Real-time Occupancy Matrix</h3>

            {/* Screen Visualization */}
            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
              <div style={{
                width: '100%',
                height: '10px',
                background: 'linear-gradient(to right, transparent, var(--color-primary), transparent)',
                borderRadius: '50%',
                boxShadow: '0 4px 15px var(--color-primary)',
                marginBottom: '8px'
              }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: '600' }}>
                SCREEN (FRONT)
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px' }}>Refreshing seat map data...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', overflowX: 'auto', paddingBottom: '16px' }}>
                {sortedRows.map(row => (
                  <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-muted)', width: '20px', textAlign: 'center' }}>{row}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {seatsByRow[row].map(seat => {
                        let seatBg = 'rgba(255, 255, 255, 0.05)';
                        let seatBorder = '1px solid var(--border-color)';
                        
                        if (seat.isBooked) {
                          seatBg = 'rgba(225, 29, 72, 0.3)';
                          seatBorder = '1px solid var(--color-primary)';
                        }

                        return (
                          <div
                            key={seat.id}
                            title={`Seat ${row}${seat.seatNumber} (${seat.isBooked ? 'Booked' : 'Available'})`}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              background: seatBg,
                              border: seatBorder,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: seat.isBooked ? 'var(--color-primary)' : 'var(--text-main)',
                              userSelect: 'none'
                            }}
                          >
                            {seat.isBooked ? '✕' : seat.seatNumber}
                          </div>
                        );
                      })}
                    </div>
                    <span style={{ fontWeight: '700', color: 'var(--text-muted)', width: '20px', textAlign: 'center' }}>{row}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Seat Map Legend */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)' }} />
                <span>Available ({availableSeatsCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'rgba(225, 29, 72, 0.3)', border: '1px solid var(--color-primary)' }} />
                <span>Booked ({bookedSeatsCount})</span>
              </div>
            </div>
          </div>

          {/* Seat Statistics panel */}
          <div className="glass-panel glow-cyan" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Performance Analytics
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Capacities</span>
                <span style={{ fontWeight: '700' }}>{totalSeatsCount} Seats</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Booked Tickets</span>
                <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{bookedSeatsCount} Seats</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Available Seats</span>
                <span style={{ fontWeight: '700', color: 'var(--color-success)' }}>{availableSeatsCount} Seats</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Occupancy Ratios</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-secondary)' }}>{occupancyRate.toFixed(1)}%</span>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${occupancyRate}%`, height: '100%', background: 'linear-gradient(to right, var(--color-secondary), var(--color-primary))', borderRadius: '4px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Estimated Revenue</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-accent)' }}>
                  ${revenueGenerated.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedShowId && (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎭</div>
          <h3>Select a scheduled show from the dropdown to inspect occupancy and revenue analytics.</h3>
        </div>
      )}
    </div>
  );
}
