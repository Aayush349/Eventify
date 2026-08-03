import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchAdminAnalytics } from '../../features/admin/adminSlice';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminAnalytics());
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <div style={{ paddingTop: '8rem', minHeight: '100vh', background: '#f8fafc', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto' }} />
        <p style={{ color: '#64748b', fontSize: '1.25rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
          Aggregating Master Platform Analytics...
        </p>
      </div>
    );
  }

  const statCards = [
    {
      icon: '💰',
      label: 'Simulated Platform Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`,
      desc: 'Aggregated from confirmed demo order invoices',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      icon: '🎟️',
      label: 'Confirmed Pass Bookings',
      value: stats?.totalBookings?.toLocaleString('en-IN') || 0,
      desc: `Active customer reservations (${stats?.totalCancelled || 0} cancellations)`,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
    },
    {
      icon: '👥',
      label: 'Total Registered Accounts',
      value: stats?.totalUsers?.toLocaleString('en-IN') || 0,
      desc: 'Includes customers, organizers & administrators',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      icon: '🎪',
      label: 'Live & Catalog Events',
      value: stats?.totalEvents?.toLocaleString('en-IN') || 3,
      desc: 'Concerts, IPL cricket matches & EDM festivals',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
  ];

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
        {/* Animated ambient glowing orbs */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          top: '-100px', right: '5%', animation: 'orbFloat 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
          bottom: '-50px', left: '2%', animation: 'orbFloat 10s ease-in-out infinite reverse',
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
                background: 'rgba(99, 102, 241, 0.25)', border: '1px solid rgba(99, 102, 241, 0.5)',
                color: '#a5b4fc', borderRadius: '9999px', padding: '0.375rem 1.25rem',
                fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                marginBottom: '1.25rem', backdropFilter: 'blur(4px)'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                Master System Administration
              </span>
            </motion.div>

            {/* Headline and buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
              <motion.div variants={fadeUp} style={{ maxWidth: '680px' }}>
                <h1 style={{ color: '#ffffff', fontSize: '2.75rem', marginBottom: '1rem', fontWeight: 800, lineHeight: 1.15 }}>
                  Platform Governance &{' '}
                  <span className="gradient-text">Revenue Analytics</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.125rem', margin: 0, lineHeight: 1.6 }}>
                  Real-time supervisory oversight of user registrations, event commerce volume, and simulated ticketing transactions across all nodes.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  to="/admin/events/create"
                  className="btn btn-primary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)' }}
                >
                  <span>✨</span> + Create New Event
                </Link>
                <Link
                  to="/admin/events"
                  className="btn btn-lg"
                  style={{
                    background: 'rgba(255,255,255,0.12)', color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none'
                  }}
                >
                  <span>🎪</span> Manage & Edit Events
                </Link>
                <Link
                  to="/admin/users"
                  className="btn btn-lg"
                  style={{
                    background: 'rgba(255,255,255,0.12)', color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none'
                  }}
                >
                  <span>👥</span> User Governance
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Wave separator transitioning into page background */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
            <path d="M0 60L480 15L960 45L1440 0V60H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ──── Analytics & Data Feed Section ────────────────────────────── */}
      <section className="section" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <div className="container">
          
          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '2.5rem', fontWeight: 600 }}>
              ⚠️ Error loading statistics: {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          {/* Metric Cards Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3.5rem'
            }}
          >
            {statCards.map((card, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="card"
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.75rem',
                  borderRadius: '1.25rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 25px -5px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(0,0,0,0.05)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <span style={{
                      backgroundColor: card.bgColor, color: card.color,
                      padding: '0.35rem 0.75rem', borderRadius: '9999px',
                      fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      {card.label}
                    </span>
                    <span style={{ fontSize: '1.5rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
                      {card.icon}
                    </span>
                  </div>
                  <h2 style={{ color: '#0f172a', fontSize: '2.5rem', margin: 0, fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                    {card.value}
                  </h2>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '1rem 0 0 0', fontWeight: 500, borderTop: '1px dashed #e2e8f0', paddingTop: '0.75rem' }}>
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Master Organizer Control Hub Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{ marginBottom: '3.5rem' }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ color: '#7c3aed', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ⚡ MASTER ORGANIZER CONTROL SUITE
              </span>
              <h2 style={{ fontSize: '1.8rem', margin: '0.2rem 0 0 0', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                Event Management & Operations
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {/* Card 1 */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '42px', height: '42px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
                    ✨
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Create New Event
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                    Publish concerts, IPL sports, and EDM festivals with customized ticket tiers, pricing, and banners.
                  </p>
                </div>
                <Link to="/admin/events/create" className="btn btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  + Create Event Now
                </Link>
              </div>

              {/* Card 2 */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '42px', height: '42px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
                    🎪
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Moderate & Edit Catalog
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                    Inspect all catalog events, edit ticket quantities, update descriptions, or apply status overrides.
                  </p>
                </div>
                <Link to="/admin/events" className="btn" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>
                  Manage Catalog →
                </Link>
              </div>

              {/* Card 3 */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '42px', height: '42px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
                    📡
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Gate QR Scanner
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                    Scan attendee digital QR passes at venue gates to verify entry, approve check-ins, and stop duplicate passes.
                  </p>
                </div>
                <Link to="/admin/verify" className="btn" style={{ backgroundColor: '#f8fafc', color: '#4338ca', border: '1px solid #c7d2fe', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>
                  Open Scanner Terminal →
                </Link>
              </div>

              {/* Card 4 */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '42px', height: '42px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
                    👥
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    User Governance
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                    Inspect registered user accounts, search signups, and elevate user permissions to Organizer or Admin roles.
                  </p>
                </div>
                <Link to="/admin/users" className="btn" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>
                  Manage Accounts →
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Live Recent Transactions Feed */}
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
                  <span>📡</span> Recent Platform Transaction Feed
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                  Real-time audit log of customer ticket bookings and financial settlement statuses.
                </p>
              </div>
              <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                Live Stream • {stats?.recentBookings?.length || 0} Records
              </span>
            </div>

            {!stats?.recentBookings?.length ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                  No ticketing transactions recorded on the platform yet.
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.35rem 0 0 0' }}>
                  Once attendees start making reservations, real-time invoices will stream here automatically.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                      <th style={{ padding: '1rem 2rem' }}>Reference ID</th>
                      <th style={{ padding: '1rem 1.5rem' }}>Attendee</th>
                      <th style={{ padding: '1rem 1.5rem' }}>Event Title</th>
                      <th style={{ padding: '1rem 1.5rem' }}>Amount Settled</th>
                      <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                      <th style={{ padding: '1rem 2rem' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((bk, index) => {
                      const isConfirmed = bk.bookingStatus === 'confirmed';
                      return (
                        <tr
                          key={bk._id || index}
                          style={{
                            borderBottom: index === stats.recentBookings.length - 1 ? 'none' : '1px solid #f1f5f9',
                            backgroundColor: '#ffffff',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                          <td style={{ padding: '1.25rem 2rem', color: '#4f46e5', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                            {bk.bookingReference}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#1e293b' }}>
                            {bk.attendeeDetails?.name || bk.user?.name || 'Customer'}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', color: '#334155', fontWeight: 500 }}>
                            {bk.event?.title || 'Event Pass'}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>
                            ₹{bk.finalAmount?.toLocaleString('en-IN') || 0}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={{
                              backgroundColor: isConfirmed ? '#dcfce7' : '#fef2f2',
                              color: isConfirmed ? '#15803d' : '#b91c1c',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              border: `1px solid ${isConfirmed ? '#86efac' : '#fca5a5'}`
                            }}>
                              {bk.bookingStatus}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 2rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                            {new Date(bk.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
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

export default AdminDashboard;
