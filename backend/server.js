require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const passport = require('passport');
const http = require('http');

const connectDB = require('./src/config/db');
const configurePassport = require('./src/config/passport');
require('./src/config/cloudinary'); // Initialize Cloudinary (stub in Phase 3)

const apiRoutes = require('./src/routes/index');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Trust Proxy (required for secure cookies behind Render's reverse proxy) ──
app.set('trust proxy', 1);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow embedding for development
  })
);
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://ticket-booking-frontend-1ola.onrender.com',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Passport ─────────────────────────────────────────────────────────────────
configurePassport();
app.use(passport.initialize());

// ─── Request Logging ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);
app.use('/', apiRoutes); // Allow API access without /api/v1 prefix (e.g., /auth/google)

// ─── Root Route ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎟️ Ticket Booking System API',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    server.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🎟️  ═══════════════════════════════════════════');
      console.log(`🚀  Server running on port ${PORT}`);
      console.log(`🌍  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡  API Base: http://localhost:${PORT}/api/v1`);
      console.log(`🏥  Health:   http://localhost:${PORT}/api/v1/health`);
      console.log('🎟️  ═══════════════════════════════════════════');
      console.log('');
    });

    await connectDB();
  } catch (error) {
    console.error('❌ Failed during database connection:', error.message);
  }
};

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection:', reason);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated.');
  });
});

startServer();

module.exports = { app, server };
