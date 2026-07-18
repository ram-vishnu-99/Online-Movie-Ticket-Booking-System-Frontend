import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function RevenueReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/bookings/reports/revenue`);
      if (!res.ok) throw new Error('Failed to retrieve financial reports');
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', fontSize: '1.2rem', padding: '40px' }}>Analyzing transactional ledgers...</div>;
  if (error) return <div style={{ color: 'var(--color-primary)', textAlign: 'center', padding: '20px' }}>{error}</div>;
  if (!report) return <div style={{ textAlign: 'center', padding: '20px' }}>No revenue records found.</div>;

  const { totalRevenue, totalTicketsSold, totalBookingsCount, revenueByMovie, revenueByTheater } = report;

  // Helpers to find max revenue values for custom CSS relative chart scaling
  const movieEntries = Object.entries(revenueByMovie || {});
  const maxMovieRevenue = movieEntries.length > 0 ? Math.max(...movieEntries.map(e => e[1])) : 1;

  const theaterEntries = Object.entries(revenueByTheater || {});
  const maxTheaterRevenue = theaterEntries.length > 0 ? Math.max(...theaterEntries.map(e => e[1])) : 1;

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Executive Revenue Reports</h2>
        <p style={{ color: 'var(--text-muted)' }}>Financial dashboard showing sales totals, customer bookings, and product performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '40px' }}>
        <div className="glass-panel glow-cyan" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Gross Revenue</span>
          <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-accent)' }}>
            ${totalRevenue.toFixed(2)}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accumulated income from ticket sales</span>
        </div>

        <div className="glass-panel glow-pink" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Tickets Sold</span>
          <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-secondary)' }}>
            {totalTicketsSold}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total seats reserved across shows</span>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Transactions</span>
          <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {totalBookingsCount}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed booking checkouts</span>
        </div>
      </div>

      {/* Analytics Charts (Custom CSS Bar Charts) */}
      <div className="grid-cols-2">
        {/* Revenue by Movie Chart */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Revenue Distribution by Film
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {movieEntries.map(([movieName, revenue]) => {
              const percentage = (revenue / maxMovieRevenue) * 100;
              return (
                <div key={movieName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: '600' }}>{movieName}</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-accent)' }}>${revenue.toFixed(2)}</span>
                  </div>
                  {/* Progress Bar Container */}
                  <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      background: 'linear-gradient(to right, var(--color-primary), #fda4af)', 
                      borderRadius: '6px',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  </div>
                </div>
              );
            })}
            {movieEntries.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                No movie revenue logs found.
              </div>
            )}
          </div>
        </div>

        {/* Revenue by Theater Chart */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Revenue Performance by Theater Hall
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {theaterEntries.map(([theaterName, revenue]) => {
              const percentage = (revenue / maxTheaterRevenue) * 100;
              return (
                <div key={theaterName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: '600' }}>{theaterName}</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-accent)' }}>${revenue.toFixed(2)}</span>
                  </div>
                  {/* Progress Bar Container */}
                  <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      background: 'linear-gradient(to right, var(--color-secondary), #a5f3fc)', 
                      borderRadius: '6px',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  </div>
                </div>
              );
            })}
            {theaterEntries.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                No theater revenue logs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
