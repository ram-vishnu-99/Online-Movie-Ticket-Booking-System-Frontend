import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function TheaterManagement() {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rowCount, setRowCount] = useState('');
  const [colCount, setColCount] = useState('');

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/theaters`);
      if (!res.ok) throw new Error('Failed to fetch theaters');
      setTheaters(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (theater) => {
    setEditingId(theater.id);
    setName(theater.name);
    setLocation(theater.location);
    setRowCount(theater.rowCount);
    setColCount(theater.colCount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setLocation('');
    setRowCount('');
    setColCount('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      location,
      rowCount: parseInt(rowCount),
      colCount: parseInt(colCount)
    };

    try {
      let res;
      if (editingId) {
        // Update
        res = await fetch(`${API_BASE_URL}/theaters/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create
        res = await fetch(`${API_BASE_URL}/theaters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      setSuccess(editingId ? 'Theater updated successfully!' : 'Theater added successfully!');
      handleCancelEdit();
      fetchTheaters();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this theater? Scheduled shows mapping to this theater will also be affected.')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/theaters/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete theater');

      setSuccess('Theater screen deleted successfully');
      setTheaters(theaters.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Theater Room Management</h2>
        <p style={{ color: 'var(--text-muted)' }}>Configure physical layouts, grid seating row dimensions, and screen capacities.</p>
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
        <div className="glass-panel glow-cyan" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
            {editingId ? 'Edit Screen Details' : 'Add New Screen'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Screen Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="IMAX Screen 1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input 
                type="text" 
                className="form-input" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                required 
                placeholder="Downtown Mall"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Row Count (A, B, C...)</label>
              <input 
                type="number" 
                className="form-input" 
                value={rowCount} 
                onChange={e => setRowCount(e.target.value)} 
                required 
                placeholder="6 (will generate rows A to F)"
                min="1"
                max="26"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Column Count (Seats per Row)</label>
              <input 
                type="number" 
                className="form-input" 
                value={colCount} 
                onChange={e => setColCount(e.target.value)} 
                required 
                placeholder="10 (will generate seats 1 to 10)"
                min="1"
                max="30"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-secondary" style={{ flex: 1 }}>
                {editingId ? 'Save Changes' : 'Create Screen'}
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
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Configured Screens</h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading screen layout registers...</div>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Screen Name</th>
                    <th>Location</th>
                    <th>Grid Dimension</th>
                    <th>Total Capacity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {theaters.map(theater => (
                    <tr key={theater.id}>
                      <td style={{ fontWeight: '600' }}>{theater.name}</td>
                      <td>📍 {theater.location}</td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {theater.rowCount} Rows x {theater.colCount} Cols
                      </td>
                      <td style={{ color: 'var(--color-secondary)', fontWeight: '700' }}>
                        {theater.rowCount * theater.colCount} Seats
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-outline" 
                            onClick={() => handleEdit(theater)}
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--border-color)' }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-outline" 
                            onClick={() => handleDelete(theater.id)}
                            style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {theaters.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                        No theater screens found. Register one on the left.
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
