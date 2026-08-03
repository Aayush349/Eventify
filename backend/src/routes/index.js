const express = require('express');

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// ─── Health Check ──────────────────────────────────────────────────────────────
router.use('/health', healthRoutes);

// ─── Phase 2: Auth ────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ─── Phase 3: Events ──────────────────────────────────────────────────────────
router.use('/events', eventRoutes);
router.use('/organizer/events', eventRoutes); // alias for organizer's own list

// ─── Phase 4: Bookings ────────────────────────────────────────────────────────
router.use('/bookings', bookingRoutes);

// ─── Phase 5: Demo Payments ───────────────────────────────────────────────────
router.use('/payments', paymentRoutes);

// ─── Phase 6: Admin Suite ─────────────────────────────────────────────────────
router.use('/admin', adminRoutes);

module.exports = router;
