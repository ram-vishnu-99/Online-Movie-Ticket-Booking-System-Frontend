import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // CUSTOMER, THEATER_MANAGER, ADMIN
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isRegister) {
      // Registration Flow
      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        
        setMessage('Registration successful! Please log in.');
        setIsRegister(false);
        setPassword('');
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Login Flow
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(data));
        onLoginSuccess(data);
        
        // Redirect based on role
        if (data.role === 'ADMIN') {
          navigate('/admin/movies');
        } else if (data.role === 'THEATER_MANAGER') {
          navigate('/manager/shows');
        } else {
          navigate('/');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel glow-pink" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.8rem', background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              placeholder="Enter username"
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="name@example.com"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Account Type (Role)</label>
              <select 
                className="form-input" 
                value={role} 
                onChange={e => setRole(e.target.value)}
                style={{ appearance: 'none', background: 'rgba(255, 255, 255, 0.05) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 12px center', backgroundSize: '16px' }}
              >
                <option value="CUSTOMER" style={{ backgroundColor: 'var(--bg-secondary)' }}>Customer</option>
                <option value="THEATER_MANAGER" style={{ backgroundColor: 'var(--bg-secondary)' }}>Theater Manager</option>
                <option value="ADMIN" style={{ backgroundColor: 'var(--bg-secondary)' }}>Administrator</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span 
            onClick={() => { setIsRegister(!isRegister); setError(''); setMessage(''); }} 
            style={{ color: 'var(--color-secondary)', cursor: 'pointer', fontWeight: '600' }}
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}
