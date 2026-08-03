import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import EventCard from '../../components/events/EventCard';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { events } = useSelector((state) => state.events);

  const featuredEvents = events?.slice(0, 3) || [];

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
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
          top: '-100px', right: '5%', animation: 'orbFloat 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
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
                WELCOME TO DISTRICT ENTERTAINMENT
              </span>
            </motion.div>

            {/* Headline and buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
              <motion.div variants={fadeUp} style={{ maxWidth: '680px' }}>
                <h1 style={{ color: '#ffffff', fontSize: '2.75rem', marginBottom: '1rem', fontWeight: 800, lineHeight: 1.15 }}>
                  Hello, {user?.name || 'Valued Member'} 👋{' '}
                  <span className="gradient-text">Your Event Hub</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.125rem', margin: 0, lineHeight: 1.6 }}>
                  Your personal event portal is live. Discover trending concerts, reserve stadium seats, manage your digital QR passes, and explore live experiences across the platform!
                </p>
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="btn btn-primary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)', cursor: 'pointer' }}
                >
                  <span>🎟️</span> Browse Live Events
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/customer/bookings')}
                  className="btn btn-lg"
                  style={{
                    background: 'rgba(255,255,255,0.12)', color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                  }}
                >
                  My Digital Passes ({user?.role === 'admin' ? 'VIP' : 'Active'}) →
                </button>
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

      {/* ──── Main Content Section (Light Theme) ───────────────────────── */}
      <section className="section" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <div className="container">
          
          {/* Live Events Catalog Preview */}
          {featuredEvents.length > 0 && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              style={{ marginBottom: '4rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ color: '#4f46e5', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🔥 TRENDING NOW
                  </span>
                  <h2 style={{ fontSize: '1.8rem', margin: '0.2rem 0 0 0', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                    Featured Live Experiences
                  </h2>
                </div>
                <Link to="/events" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
                  View All Catalog ({events?.length || 0}) →
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {featuredEvents.map((evt) => (
                  <EventCard key={evt._id} event={evt} />
                ))}
              </div>
            </motion.div>
          )}

          {/* APPLICATION WORKFLOW GUIDE */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{ marginBottom: '4rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  📖 PLATFORM ARCHITECTURE & ONBOARDING
                </span>
                <h2 style={{ fontSize: '1.8rem', margin: '0.25rem 0 0 0', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                  Application Flow & Walkthrough Guide
                </h2>
              </div>
              <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Built in Phases 1 through 6 • Modern Light Theme</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              
              {/* Step 1 */}
              <div style={{
                backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', padding: '1.75rem',
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'transform 0.2s ease'
              }}>
                <div>
                  <div style={{ width: '42px', height: '42px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                    1
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                    Discover & Search Events
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.925rem', margin: '0 0 1.5rem 0', lineHeight: 1.6, fontWeight: 500 }}>
                    Explore our pre-seeded concert and stadium sports catalogs. Use filtering options by city (Mumbai, Goa) and category (Concerts, Sports, Festivals).
                  </p>
                </div>
                <Link to="/events" style={{ color: '#059669', fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem', display: 'inline-block' }}>
                  Go to Events Directory →
                </Link>
              </div>

              {/* Step 2 */}
              <div style={{
                backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', padding: '1.75rem',
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'transform 0.2s ease'
              }}>
                <div>
                  <div style={{ width: '42px', height: '42px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                    2
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                    Seat & Tier Selection
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.925rem', margin: '0 0 1.5rem 0', lineHeight: 1.6, fontWeight: 500 }}>
                    Choose from VIP Platinum lounges, Gold Arena stands, or Club Pavilion boxes. Real-time atomic inventory deduction prevents overbooking!
                  </p>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ Triggered via Event Detail pages
                </span>
              </div>

              {/* Step 3 */}
              <div style={{
                backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', padding: '1.75rem',
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'transform 0.2s ease'
              }}>
                <div>
                  <div style={{ width: '42px', height: '42px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                    3
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                    Instant Checkout
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.925rem', margin: '0 0 1.5rem 0', lineHeight: 1.6, fontWeight: 500 }}>
                    One-tap checkout automatically generates your confirmed digital QR ticket pass instantly without waiting screens!
                  </p>
                </div>
                <Link to="/customer/bookings" style={{ color: '#059669', fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem', display: 'inline-block' }}>
                  View Digital Passes →
                </Link>
              </div>

              {/* Step 4 */}
              <div style={{
                backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', padding: '1.75rem',
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'transform 0.2s ease'
              }}>
                <div>
                  <div style={{ width: '42px', height: '42px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                    4
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                    QR Pass & Gate Scanner
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.925rem', margin: '0 0 1.5rem 0', lineHeight: 1.6, fontWeight: 500 }}>
                    Download scannable QR passes. Organizers and stadium gate staff can verify entry using our live terminal scanner!
                  </p>
                </div>
                <Link to="/organizer/verify" style={{ color: '#4f46e5', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                  Open Gate QR Scanner →
                </Link>
              </div>

            </div>
          </motion.div>

          {/* Role-Specific Quick Control Towers */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{
              backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.25rem', padding: '2rem',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)'
            }}
          >
            <h3 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', fontSize: '1.35rem', fontWeight: 800, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>
              ⚡ Quick Control Portal ({user?.role?.toUpperCase() || 'MEMBER'} ACCESS)
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 500 }}>
              Based on your user access privileges, here are your direct navigation endpoints:
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/customer/bookings"
                style={{ flex: '1 1 200px', padding: '0.9rem 1.25rem', backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '0.75rem', color: '#0f172a', textDecoration: 'none', fontWeight: '700', textAlign: 'center', transition: 'all 0.15s ease' }}
              >
                🎟️ My Ticket History
              </Link>

              <Link
                to="/customer/profile"
                style={{ flex: '1 1 200px', padding: '0.9rem 1.25rem', backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '0.75rem', color: '#0f172a', textDecoration: 'none', fontWeight: '700', textAlign: 'center', transition: 'all 0.15s ease' }}
              >
                👤 Account Settings & Security
              </Link>

              {(user?.role === 'organizer' || user?.role === 'admin') && (
                <>
                  <Link
                    to="/organizer/dashboard"
                    style={{ flex: '1 1 200px', padding: '0.9rem 1.25rem', backgroundColor: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '0.75rem', color: '#047857', textDecoration: 'none', fontWeight: '800', textAlign: 'center' }}
                  >
                    🎪 Organizer Event Hub
                  </Link>

                  <Link
                    to="/organizer/verify"
                    style={{ flex: '1 1 200px', padding: '0.9rem 1.25rem', backgroundColor: '#e0e7ff', border: '1.5px solid #6366f1', borderRadius: '0.75rem', color: '#3730a3', textDecoration: 'none', fontWeight: '800', textAlign: 'center' }}
                  >
                    📡 Gate QR Check-In Scanner
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  style={{ flex: '1 1 200px', padding: '0.9rem 1.25rem', backgroundColor: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: '0.75rem', color: '#b91c1c', textDecoration: 'none', fontWeight: '800', textAlign: 'center' }}
                >
                  🛡️ Master Admin Control Center
                </Link>
              )}
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}

export default CustomerDashboard;
