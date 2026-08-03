import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Animated 404 */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 'clamp(6rem, 20vw, 10rem)', lineHeight: 1, marginBottom: '1rem' }}
        >
          🎟️
        </motion.div>

        <h1
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: 'clamp(5rem, 15vw, 8rem)',
            fontWeight: 900,
            marginBottom: '0.5rem',
            lineHeight: 1,
          }}
        >
          404
        </h1>

        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
          This ticket doesn't exist!
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.0625rem', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
          The page you're looking for has either been cancelled or never existed. Let's get you back on track.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" id="not-found-home" className="btn btn-primary btn-lg">
            🏠 Go Home
          </Link>
          <Link to="/events" id="not-found-events" className="btn btn-lg" style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            Browse Events
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
