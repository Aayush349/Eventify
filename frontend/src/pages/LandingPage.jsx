import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectFeaturedEvents } from '../features/events/eventSlice';
import EventCard from '../components/events/EventCard';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

// ─── Category Data ────────────────────────────────────────────────────────────
const categories = [
  { icon: '🎵', label: 'Concerts', count: '1.2k+ events', color: '#6366f1' },
  { icon: '⚽', label: 'Sports', count: '800+ events', color: '#10b981' },
  { icon: '🎭', label: 'Theatre', count: '500+ events', color: '#f59e0b' },
  { icon: '😂', label: 'Comedy', count: '300+ events', color: '#ef4444' },
  { icon: '🎨', label: 'Art & Culture', count: '400+ events', color: '#a855f7' },
  { icon: '🎤', label: 'Standup', count: '250+ events', color: '#3b82f6' },
];

// ─── Stats ───────────────────────────────────────────────────────────────────
const stats = [
  { value: '50K+', label: 'Events Listed' },
  { value: '2M+', label: 'Tickets Sold' },
  { value: '500+', label: 'Cities Covered' },
  { value: '4.9★', label: 'User Rating' },
];

// ─── How It Works ─────────────────────────────────────────────────────────────
const steps = [
  { step: '01', icon: '🔍', title: 'Discover Events', desc: 'Browse thousands of concerts, sports, and cultural events curated for you.' },
  { step: '02', icon: '💺', title: 'Pick Your Seats', desc: 'Interactive seat maps let you choose exactly where you want to sit.' },
  { step: '03', icon: '💳', title: 'Secure Payment', desc: 'Pay safely with cards, UPI, or wallets. Instant confirmation.' },
  { step: '04', icon: '🎟️', title: 'Get Your Ticket', desc: 'Download your QR-coded ticket instantly. Show it at the gate.' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const LandingPage = () => {
  const featuredEvents = useSelector(selectFeaturedEvents);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ──── Hero Section ──────────────────────────────────────────────── */}
      <section
        id="hero"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background orbs */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          top: '-100px', left: '-100px', animation: 'orbFloat 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
          bottom: '-50px', right: '-50px', animation: 'orbFloat 10s ease-in-out infinite reverse',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '6rem', paddingBottom: '4rem' }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
          >
            {/* Pill badge */}
            <motion.div variants={fadeUp}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#a5b4fc', borderRadius: '9999px', padding: '0.375rem 1rem',
                fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', animation: 'pulse 2s infinite' }} />
                🎉 Over 50,000 events available now
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} style={{ color: 'white', marginBottom: '1.25rem', lineHeight: 1.1 }}>
              Book Tickets for
              <span className="gradient-text" style={{ display: 'block' }}>
                Unforgettable Experiences
              </span>
            </motion.h1>

            {/* Subline */}
            <motion.p variants={fadeUp} style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: '560px', margin: '0 auto 2.5rem' }}>
              Discover concerts, sports events, theatre shows, and more. Secure seats in seconds with real-time availability.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/events" id="hero-cta-explore" className="btn btn-primary btn-lg">
                Explore Events →
              </Link>
              {isAuthenticated && user ? (
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'organizer' ? '/organizer/dashboard' : '/customer/dashboard'}
                  id="hero-cta-dashboard"
                  className="btn btn-lg"
                  style={{
                    background: 'rgba(255,255,255,0.15)', color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)',
                    fontWeight: 700
                  }}
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <Link to="/auth/register" id="hero-cta-register" className="btn btn-lg" style={{
                  background: 'rgba(255,255,255,0.1)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                }}>
                  Create Free Account
                </Link>
              )}
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={fadeIn} style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
              {stats.map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem' }}>
                    {stat.value}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Wave separator */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
            <path d="M0 80L480 20L960 60L1440 0V80H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ──── Categories Section ─────────────────────────────────────────── */}
      <section id="categories" className="section" style={{ background: 'var(--color-surface-2)' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2>Browse by Category</h2>
              <p style={{ marginTop: '0.75rem', fontSize: '1.0625rem' }}>
                Find events across all genres — there's something for everyone.
              </p>
            </motion.div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '1rem',
            }}>
              {categories.map((cat, i) => (
                <motion.div key={cat.label} variants={fadeUp}>
                  <Link
                    to={`/events?category=${cat.label.toLowerCase()}`}
                    id={`category-${cat.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className="card"
                    style={{
                      textAlign: 'center',
                      padding: '1.5rem 1rem',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'block',
                    }}
                  >
                    <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                      {cat.label}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: cat.color, fontWeight: 500 }}>
                      {cat.count}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── Featured Events ────────────────────────────────────────────── */}
      <section id="featured-events" className="section">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2>🔥 Featured Events</h2>
                <p style={{ marginTop: '0.5rem' }}>Don't miss the most popular events this season.</p>
              </div>
              <Link to="/events" className="btn btn-secondary btn-sm" id="view-all-events">
                View All Events →
              </Link>
            </motion.div>

            {featuredEvents.length === 0 ? (
              /* Placeholder cards shown when no real events exist yet */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', opacity: 0.6 }}>
                    <div style={{ aspectRatio: '16/9', background: '#f1f5f9' }} />
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ height: '14px', background: '#e2e8f0', borderRadius: '4px', width: '70%', marginBottom: '0.75rem' }} />
                      <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '4px', width: '50%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {featuredEvents.map((event) => (
                  <motion.div key={event._id} variants={fadeUp}>
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ──── How It Works ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="section" style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1535 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{ color: 'white' }}>How It Works</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.75rem' }}>
                Book your ticket in 4 simple steps.
              </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {steps.map((step, i) => (
                <motion.div key={step.step} variants={fadeUp}>
                  <div className="card-glass" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{step.icon}</div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.875rem',
                      color: 'var(--color-primary)', marginBottom: '0.5rem', letterSpacing: '0.08em',
                    }}>
                      STEP {step.step}
                    </div>
                    <h4 style={{ color: 'white', marginBottom: '0.75rem' }}>{step.title}</h4>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── CTA Banner ─────────────────────────────────────────────────── */}
      <section id="cta-banner" style={{ padding: '5rem 0', background: 'var(--color-surface-2)' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(2rem, 5vw, 4rem)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px',
              borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
            }} />
            <div style={{
              position: 'absolute', bottom: '-60px', left: '-60px', width: '280px', height: '280px',
              borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ color: 'white', marginBottom: '1rem' }}>
                Ready to Experience Something Extraordinary?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.0625rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                Join 2 million+ people who use TicketHub to discover and book the best events.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {isAuthenticated && user ? (
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'organizer' ? '/organizer/dashboard' : '/customer/dashboard'}
                    id="cta-dashboard-btn"
                    className="btn btn-lg"
                    style={{ background: 'white', color: 'var(--color-primary)', fontWeight: 700 }}
                  >
                    Go to Dashboard →
                  </Link>
                ) : (
                  <Link
                    to="/auth/register"
                    id="cta-register-btn"
                    className="btn btn-lg"
                    style={{ background: 'white', color: 'var(--color-primary)', fontWeight: 700 }}
                  >
                    Get Started Free →
                  </Link>
                )}
                <Link
                  to="/events"
                  id="cta-browse-btn"
                  className="btn btn-lg"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  Browse Events
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── Animations ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
