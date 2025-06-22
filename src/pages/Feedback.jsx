import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { BACKGROUND_COLORS, DARK_MODE_COLORS } from '../constants/colors';

const Feedback = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const { theme } = useTheme();

  const colors = theme === 'dark' ? DARK_MODE_COLORS : {
    PAGE_BG: BACKGROUND_COLORS.MAIN,
    PANEL_BG: '#FFFFFF',
    CARD_INNER_BG: '#FFFFFF',
    BORDER: '#E5E5E5',
    TEXT_PRIMARY: '#1A1A1A',
    TEXT_SECONDARY: '#666666',
    TEXT_DISABLED: '#999999',
    ACCENT_PURPLE: '#7C3AED',
    ACCENT_TEAL: '#0D9488',
    ACCENT_ORANGE: '#D97706',
    ACCENT_RED: '#DC2626',
    ACCENT_GREEN: '#059669',
    ICON_DEFAULT: '#666666',
    ICON_HOVER: '#1A1A1A'
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/users/feedback');
      const data = await res.json();
      setFeedbacks(data.reverse()); // Most recent first
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      let data = {};
      if (res.headers.get('content-type')?.includes('application/json')) {
        data = await res.json();
      }
      if (!res.ok) throw new Error(data.error || 'Failed to send feedback');
      setForm({ name: '', email: '', message: '' });
      fetchFeedbacks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="feedback-page"
      style={{
        maxWidth: 500,
        margin: '40px auto',
        padding: 24,
        background: colors.PANEL_BG,
        borderRadius: 12,
        boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.07)',
        border: `1px solid ${colors.BORDER}`,
        color: colors.TEXT_PRIMARY
      }}
    >
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: colors.TEXT_PRIMARY }}>We value your feedback</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: colors.TEXT_SECONDARY }}>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 6,
              border: `1px solid ${colors.BORDER}`,
              background: colors.CARD_INNER_BG,
              color: colors.TEXT_PRIMARY
            }}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: colors.TEXT_SECONDARY }}>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 6,
              border: `1px solid ${colors.BORDER}`,
              background: colors.CARD_INNER_BG,
              color: colors.TEXT_PRIMARY
            }}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: colors.TEXT_SECONDARY }}>Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 6,
              border: `1px solid ${colors.BORDER}`,
              background: colors.CARD_INNER_BG,
              color: colors.TEXT_PRIMARY
            }}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          style={{
            background: colors.ACCENT_PURPLE,
            color: '#fff',
            padding: '10px 24px',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Submit'}
        </button>
        {error && (
          <div style={{ marginTop: 16, color: colors.ACCENT_RED, fontWeight: 500 }}>
            {error}
          </div>
        )}
      </form>
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: colors.TEXT_PRIMARY }}>All Feedback</h3>
        {feedbacks.length === 0 ? (
          <div style={{ color: colors.TEXT_SECONDARY }}>No feedback yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {feedbacks.map((fb, idx) => (
              <li key={idx} style={{
                marginBottom: 20,
                padding: 16,
                background: colors.CARD_INNER_BG,
                borderRadius: 8,
                border: `1px solid ${colors.BORDER}`
              }}>
                <div style={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}>{fb.name} <span style={{ color: colors.TEXT_SECONDARY, fontWeight: 400 }}>({fb.email})</span></div>
                <div style={{ margin: '8px 0', color: colors.TEXT_PRIMARY }}>{fb.message}</div>
                <div style={{ fontSize: 12, color: colors.TEXT_DISABLED }}>{new Date(fb.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Feedback; 