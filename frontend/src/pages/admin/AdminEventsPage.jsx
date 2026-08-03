import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchAllEventsAdmin, updateEventStatusAdmin, clearAdminMessages } from '../../features/admin/adminSlice';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function AdminEventsPage() {
  const dispatch = useDispatch();
  const { events, loading, error, actionSuccess } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllEventsAdmin());
  }, [dispatch]);

  const handleStatusOverride = (eventId, newStatus) => {
    if (window.confirm(`Override event publication status to '${newStatus.toUpperCase()}'?`)) {
      dispatch(updateEventStatusAdmin({ id: eventId, status: newStatus }));
    }
  };

  return (
    <div style={{ overflowX: 'hidden', background: 'var(--color-surface-2)', minHeight: '100vh' }}>
      
      {/* ──── Hero Banner Section ──────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '6rem',
          paddingBottom: '5rem',
        }}
      >
        {/* Animated background glowing orbs */}
        <div style={{
          position: 'absolute', width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)',
          top: '-80px', right: '8%', animation: 'orbFloat 9s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '380px', height: '380px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          bottom: '-60px', left: '4%', animation: 'orbFloat 11s ease-in-out infinite reverse',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Pill Badge */}
            <motion.div variants={fadeUp}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8', borderRadius: '9999px', padding: '0.375rem 1.25rem',
                fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                marginBottom: '1.25rem', backdropFilter: 'blur(4px)'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', animation: 'pulse 2s infinite' }} />
                Admin Event Moderation
              </span>
            </motion.div>

            {/* Title & Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
              <motion.div variants={fadeUp} style={{ maxWidth: '680px' }}>
                <h1 style={{ color: '#ffffff', fontSize: '2.65rem', marginBottom: '0.85rem', fontWeight: 800, lineHeight: 1.15 }}>
                  Master Catalog &{' '}
                  <span className="gradient-text">Content Supervision</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', margin: 0, lineHeight: 1.6 }}>
                  Inspect all live and catalog events hosted across organizers and apply emergency supervisory status overrides when necessary.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  to="/admin/events/create"
                  className="btn btn-primary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', fontWeight: 800 }}
                >
                  <span>✨</span> + Create New Event
                </Link>

                <Link
                  to="/admin/dashboard"
                  className="btn btn-lg"
                  style={{
                    background: 'rgba(255,255,255,0.12)', color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none',
                    fontWeight: 700
                  }}
                >
                  <span>←</span> Back to Dashboard
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Wave separator */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
            <path d="M0 60L480 15L960 45L1440 0V60H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ──── Catalog & Moderation Table Section ──────────────────────── */}
      <section className="section" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <div className="container">

          {actionSuccess && (
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
              <span>✅ {actionSuccess}</span>
              <button type="button" onClick={() => dispatch(clearAdminMessages())} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>✕</button>
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '2rem', fontWeight: 600 }}>
              ⚠️ {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          {/* Table Container Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span>🎪</span> Live Master Events Directory
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                  Centralized list of all events. Edit listings, create new events, or set status overrides.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Link to="/admin/events/create" className="btn btn-primary" style={{ textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                  + Create Event
                </Link>
                <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {events.length} Total Events
                </span>
              </div>
            </div>

            {loading && !events.length ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
                <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Retrieving master event catalog...</p>
              </div>
            ) : !events.length ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>No events found in catalog.</p>
                <p style={{ margin: '0 0 1.5rem 0' }}>Get started by creating your first live event.</p>
                <Link to="/admin/events/create" className="btn btn-primary">
                  + Create Event Now
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '1.25rem 2rem', fontWeight: 800 }}>Event & Title</th>
                      <th style={{ padding: '1.25rem 1.5rem', fontWeight: 800 }}>Category & Location</th>
                      <th style={{ padding: '1.25rem 1.5rem', fontWeight: 800 }}>Organizer</th>
                      <th style={{ padding: '1.25rem 1.5rem', fontWeight: 800 }}>Status</th>
                      <th style={{ padding: '1.25rem 2rem', fontWeight: 800 }}>Actions & Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((evt, idx) => {
                      const isPublished = evt.status === 'published';
                      const isCancelled = evt.status === 'cancelled';
                      return (
                        <tr
                          key={evt._id}
                          style={{
                            borderBottom: idx === events.length - 1 ? 'none' : '1px solid #f1f5f9',
                            backgroundColor: '#ffffff',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                          <td style={{ padding: '1.5rem 2rem', fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', maxWidth: '300px' }}>
                            {evt.title}
                          </td>
                          <td style={{ padding: '1.5rem 1.5rem', color: '#475569', textTransform: 'capitalize', fontWeight: 600, fontSize: '0.95rem' }}>
                            {evt.category} • <span style={{ color: '#059669', fontWeight: 700 }}>{evt.venue?.city || 'India'}</span>
                          </td>
                          <td style={{ padding: '1.5rem 1.5rem', color: '#1e293b', fontWeight: 600, fontSize: '0.95rem' }}>
                            {evt.organizer?.name || 'District Organizer'}
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginTop: '0.15rem' }}>
                              {evt.organizer?.email}
                            </div>
                          </td>
                          <td style={{ padding: '1.5rem 1.5rem' }}>
                            <span style={{
                              backgroundColor: isPublished ? '#dcfce7' : isCancelled ? '#fef2f2' : '#f1f5f9',
                              color: isPublished ? '#15803d' : isCancelled ? '#b91c1c' : '#475569',
                              padding: '0.35rem 0.85rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              border: `1px solid ${isPublished ? '#86efac' : isCancelled ? '#fca5a5' : '#cbd5e1'}`
                            }}>
                              {evt.status}
                            </span>
                          </td>
                          <td style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <select
                              value={evt.status}
                              onChange={(e) => handleStatusOverride(evt._id, e.target.value)}
                              style={{
                                padding: '0.6rem 1rem',
                                backgroundColor: '#f8fafc',
                                border: '1.5px solid #cbd5e1',
                                color: '#0f172a',
                                borderRadius: '0.6rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                fontSize: '0.9rem'
                              }}
                              onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                              onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                            >
                              <option value="published">Published (Live)</option>
                              <option value="draft">Draft (Hidden)</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            <Link
                              to={`/admin/events/${evt._id}/edit`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.55rem 0.85rem',
                                backgroundColor: '#e0e7ff',
                                color: '#4338ca',
                                borderRadius: '0.6rem',
                                textDecoration: 'none',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                border: '1px solid #c7d2fe'
                              }}
                            >
                              ✏️ Edit
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

        </div>
      </section>
    </div>
  );
}

export default AdminEventsPage;
