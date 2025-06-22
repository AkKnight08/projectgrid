import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { BACKGROUND_COLORS, DARK_MODE_COLORS } from '../constants/colors';

const Feedback = () => {
  const { user } = useUserStore();
  const [form, setForm] = useState({
    name: user?.displayName || user?.name || '',
    email: user?.email || '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const { theme } = useTheme();
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const colors = theme === 'dark' ? DARK_MODE_COLORS : {
    PAGE_BG: BACKGROUND_COLORS.MAIN,
    PANEL_BG: '#FFFFFF',
    CARD_INNER_BG: '#FFFFFF',
    BORDER: '#E5E5E5',
    TEXT_PRIMARY: '#1A1A1A',
    TEXT_SECONDARY: '#666666',
    TEXT_DISABLED: '#999999',
    ACCENT_PURPLE: '#7C3AED',
    ACCENT_RED: '#DC2626',
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }

      if (Array.isArray(data)) {
        setFeedbacks(data.reverse()); // Most recent first
      } else {
        console.error("Received non-array data from feedback API:", data);
        setFeedbacks([]);
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (user) {
      setForm(prev => ({ ...prev, name: user.displayName || user.name || '', email: user.email || '' }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      let data = {};
      if (res.headers.get('content-type')?.includes('application/json')) {
        data = await res.json();
      }
      if (!res.ok) throw new Error(data.error || 'Failed to send feedback');
      
      // Only clear the message field, keep user details
      setForm(prev => ({ ...prev, message: '' }));

      fetchFeedbacks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (feedbackId) => {
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`/api/feedback/${feedbackId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: replyText,
          authorName: user.displayName || user.name,
          authorEmail: user.email
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post reply.');

      setReplyingTo(null);
      setReplyText('');
      fetchFeedbacks();
    } catch (err) {
      alert(`Error posting reply: ${err.message}`);
    }
  };

  const handleReplyDelete = async (feedbackId, replyId) => {
    if (!user || user.email !== 'thisisakshayk@gmail.com' || !window.confirm('Are you sure?')) {
      return;
    }

    try {
      const res = await fetch(`/api/feedback/${feedbackId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-email': user.email
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete reply.');

      fetchFeedbacks(); // Refresh list
    } catch (err) {
      alert(`Error deleting reply: ${err.message}`);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!user || user.email !== 'thisisakshayk@gmail.com') {
      alert('You do not have permission to delete feedback.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const res = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-email': user.email
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete feedback.');
      }

      fetchFeedbacks(); // Refresh the list
    } catch (err) {
      console.error('Deletion Error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <div style={{ maxWidth: 700, margin: '20px auto 0', padding: '0 24px' }}>
        <Link to="/" style={{
          color: colors.ACCENT_PURPLE,
          textDecoration: 'none',
          fontWeight: 500,
          display: 'inline-block',
          marginBottom: '1rem',
        }}>
          &larr; Back to Home
        </Link>
      </div>
      <div
        className="feedback-page"
        style={{
          maxWidth: 700,
          margin: '0 auto 40px',
          padding: 24,
          background: colors.PANEL_BG,
          borderRadius: 12,
          boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.07)',
          border: `1px solid ${colors.BORDER}`,
          color: colors.TEXT_PRIMARY
        }}
      >
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: colors.TEXT_PRIMARY }}>Submit Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, color: colors.TEXT_SECONDARY }}>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={!!user}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 6,
                border: `1px solid ${colors.BORDER}`,
                background: user ? (theme === 'dark' ? '#2D3748' : '#EDF2F7') : colors.CARD_INNER_BG,
                color: colors.TEXT_PRIMARY,
                cursor: user ? 'not-allowed' : 'text',
              }}
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
              disabled={!!user}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 6,
                border: `1px solid ${colors.BORDER}`,
                background: user ? (theme === 'dark' ? '#2D3748' : '#EDF2F7') : colors.CARD_INNER_BG,
                color: colors.TEXT_PRIMARY,
                cursor: user ? 'not-allowed' : 'text',
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, color: colors.TEXT_SECONDARY }}>Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              style={{
                width: '100%',
                padding: 10,
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
              padding: '12px 24px',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              width: '100%'
            }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
          {error && (
            <div style={{ marginTop: 16, color: colors.ACCENT_RED, fontWeight: 500, textAlign: 'center' }}>
              {error}
            </div>
          )}
        </form>
        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: colors.TEXT_PRIMARY, borderBottom: `1px solid ${colors.BORDER}`, paddingBottom: 8 }}>Community Feedback</h3>
          {feedbacks.length === 0 ? (
            <div style={{ color: colors.TEXT_SECONDARY, textAlign: 'center', padding: '20px 0' }}>No feedback submitted yet. Be the first!</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {feedbacks.map((fb) => (
                <li key={fb._id} style={{
                  marginBottom: 16,
                  padding: 16,
                  background: colors.CARD_INNER_BG,
                  borderRadius: 8,
                  border: `1px solid ${colors.BORDER}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600, color: colors.TEXT_PRIMARY }}>{fb.name}</span>
                      {fb.email === 'thisisakshayk@gmail.com' && (
                        <span style={{
                          marginLeft: 8,
                          fontSize: 12,
                          fontWeight: 'bold',
                          color: colors.ACCENT_PURPLE,
                          background: `${colors.ACCENT_PURPLE}20`,
                          padding: '2px 6px',
                          borderRadius: 4
                        }}>Admin</span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: colors.TEXT_DISABLED }}>{new Date(fb.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: colors.TEXT_PRIMARY }}>{fb.message}</p>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <a href={`mailto:${fb.email}`} style={{ fontSize: 13, color: colors.ACCENT_PURPLE, textDecoration: 'none' }}>{fb.email}</a>
                    {user && user.email === 'thisisakshayk@gmail.com' && (
                      <button
                        onClick={() => handleDelete(fb._id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: colors.ACCENT_RED,
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: 13,
                          padding: '4px 8px',
                        }}
                        onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {fb.replies && fb.replies.length > 0 && (
                    <div style={{ marginTop: 12, marginLeft: 20, borderLeft: `2px solid ${colors.BORDER}`, paddingLeft: 16 }}>
                      {fb.replies.map((reply, replyIdx) => (
                        <div key={replyIdx} style={{ marginTop: 12, position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontWeight: 'bold', color: colors.TEXT_PRIMARY }}>{reply.authorName}</span>
                            <span style={{
                              marginLeft: 8,
                              fontSize: 12,
                              fontWeight: 'bold',
                              color: colors.ACCENT_PURPLE,
                              background: `${colors.ACCENT_PURPLE}20`,
                              padding: '2px 6px',
                              borderRadius: 4
                            }}>Admin</span>
                          </div>
                          <p style={{ margin: '0 0 4px 0', color: colors.TEXT_SECONDARY, paddingRight: '50px' }}>{reply.text}</p>
                          <span style={{ fontSize: 12, color: colors.TEXT_DISABLED }}>{new Date(reply.createdAt).toLocaleString()}</span>
                          {user?.email === 'thisisakshayk@gmail.com' && (
                            <button
                              onClick={() => handleReplyDelete(fb._id, reply._id)}
                              style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                background: 'transparent',
                                border: 'none',
                                color: colors.ACCENT_RED,
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: 13,
                                padding: '0'
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {user && user.email === 'thisisakshayk@gmail.com' && (
                    <div style={{ marginTop: 12 }}>
                      {replyingTo === fb._id ? (
                        <div>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows="2"
                            placeholder="Write a reply..."
                            style={{
                              width: '100%',
                              padding: 8,
                              borderRadius: 6,
                              border: `1px solid ${colors.BORDER}`,
                              background: colors.CARD_INNER_BG,
                              color: colors.TEXT_PRIMARY,
                              marginBottom: 8
                            }}
                          />
                          <button
                            onClick={() => handleReplySubmit(fb._id)}
                            style={{
                              background: colors.ACCENT_PURPLE,
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            Submit Reply
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                            style={{
                              background: 'transparent',
                              color: colors.TEXT_SECONDARY,
                              border: 'none',
                              marginLeft: 8,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(fb._id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: colors.ACCENT_PURPLE,
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: 13,
                            padding: '4px 0',
                          }}
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Feedback; 