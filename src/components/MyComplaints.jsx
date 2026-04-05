import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE, API_ORIGIN } from '../services/api';
import './MyComplaints.css';

const formatDate = (value) => {
  if (!value) return '';
  // Backend returns `YYYY-MM-DD HH:mm:ss`
  const iso = String(value).replace(' ', 'T');
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
};

const statusClass = (status) => {
  return String(status || '')
    .toLowerCase()
    .replace(' ', '-');
};

const MyComplaints = () => {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyComplaints = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/complaints/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || 'Failed to fetch complaints');
        }
        setComplaints(data.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch complaints');
      } finally {
        setLoading(false);
      }
    };

    // Always fresh: initial fetch, refetch on focus, periodic refresh, and after new complaint submit.
    fetchMyComplaints();

    const onFocus = () => fetchMyComplaints();
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchMyComplaints();
    };
    const onCreated = () => fetchMyComplaints();

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('civicfix:complaint-created', onCreated);
    const interval = setInterval(fetchMyComplaints, 15000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('civicfix:complaint-created', onCreated);
      clearInterval(interval);
    };
  }, [token]);

  return (
    <section className="section">
      <div className="container my-complaints">
        <h1 className="page-title">My Profile</h1>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : complaints.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted)' }}>No complaints found.</div>
        ) : (
          <div className="complaints-grid">
            {complaints.map((c) => (
              <div key={c.id} className="complaint-card">
                {c.image_url ? (
                  <img
                    className="complaint-image"
                    alt={c.issue_type}
                    src={`${API_ORIGIN}${c.image_url}`}
                  />
                ) : null}

                <div className="complaint-title">{c.complaint_id}</div>
                <div className="complaint-subtitle">{c.issue_type}</div>
                <div className="complaint-desc">{c.description}</div>

                <div className="complaint-meta">
                  <div className={`status-badge ${statusClass(c.status)}`}>{c.status}</div>
                  <div className="meta-item">
                    {c.area}, {c.city}
                    {c.landmark ? ` (${c.landmark})` : ''}
                  </div>
                  <div className="meta-item">Reported: {formatDate(c.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyComplaints;

