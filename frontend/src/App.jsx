import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import MovieBrowse from './pages/customer/MovieBrowse';
import SeatSelection from './pages/customer/SeatSelection';
import TicketHistory from './pages/customer/TicketHistory';
import ShowScheduling from './pages/manager/ShowScheduling';
import SeatManagement from './pages/manager/SeatManagement';
import MovieManagement from './pages/admin/MovieManagement';
import TheaterManagement from './pages/admin/TheaterManagement';
import RevenueReports from './pages/admin/RevenueReports';
import Login from './pages/Login';

function AppContent({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div>
      {/* Dynamic Nav Menu */}
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">
            <span style={{ fontSize: '1.8rem' }}>🍿</span> CyberCinema
          </Link>
          
          <div className="nav-links">
            {/* Guest navigation */}
            {!user && (
              <>
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Browse Movies</Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Sign In</Link>
              </>
            )}

            {/* Customer navigation */}
            {user && user.role === 'CUSTOMER' && (
              <>
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Browse Movies</Link>
                <Link to="/history" className={`nav-link ${isActive('/history') ? 'active' : ''}`}>My Tickets</Link>
              </>
            )}

            {/* Theater Manager navigation */}
            {user && user.role === 'THEATER_MANAGER' && (
              <>
                <Link to="/manager/shows" className={`nav-link ${isActive('/manager/shows') ? 'active' : ''}`}>Schedule Shows</Link>
                <Link to="/manager/seats" className={`nav-link ${isActive('/manager/seats') ? 'active' : ''}`}>Seat Occupancy</Link>
              </>
            )}

            {/* Administrator navigation */}
            {user && user.role === 'ADMIN' && (
              <>
                <Link to="/admin/movies" className={`nav-link ${isActive('/admin/movies') ? 'active' : ''}`}>Manage Movies</Link>
                <Link to="/admin/theaters" className={`nav-link ${isActive('/admin/theaters') ? 'active' : ''}`}>Manage Theaters</Link>
                <Link to="/admin/reports" className={`nav-link ${isActive('/admin/reports') ? 'active' : ''}`}>Revenue Reports</Link>
              </>
            )}

            {/* Logged user badge & Logout */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.username}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-secondary)' }}>
                    {user.role === 'CUSTOMER' && 'Customer'}
                    {user.role === 'THEATER_MANAGER' && 'Manager'}
                    {user.role === 'ADMIN' && 'Admin'}
                  </div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline" 
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Pages Router Viewport */}
      <main className="container" style={{ minHeight: '80vh', padding: '30px 20px' }}>
        <Routes>
          <Route path="/" element={<MovieBrowse />} />
          <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
          <Route path="/book-show/:showId" element={user ? <SeatSelection /> : <Login onLoginSuccess={setUser} />} />
          <Route path="/history" element={user && user.role === 'CUSTOMER' ? <TicketHistory /> : <Login onLoginSuccess={setUser} />} />
          
          {/* Manager paths */}
          <Route path="/manager/shows" element={user && user.role === 'THEATER_MANAGER' ? <ShowScheduling /> : <Login onLoginSuccess={setUser} />} />
          <Route path="/manager/seats" element={user && user.role === 'THEATER_MANAGER' ? <SeatManagement /> : <Login onLoginSuccess={setUser} />} />
          
          {/* Admin paths */}
          <Route path="/admin/movies" element={user && user.role === 'ADMIN' ? <MovieManagement /> : <Login onLoginSuccess={setUser} />} />
          <Route path="/admin/theaters" element={user && user.role === 'ADMIN' ? <TheaterManagement /> : <Login onLoginSuccess={setUser} />} />
          <Route path="/admin/reports" element={user && user.role === 'ADMIN' ? <RevenueReports /> : <Login onLoginSuccess={setUser} />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px 0', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div className="container">
          © {new Date().getFullYear()} CyberCinema MBS. Crafted for ultimate viewing pleasure.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <AppContent user={user} setUser={setUser} />
    </Router>
  );
}
