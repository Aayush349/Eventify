const express = require('express');
const mongoose = require('mongoose');
const { sendSuccess } = require('../utils/apiResponse');

const router = express.Router();

/**
 * GET /api/v1/health
 * Returns server health status, uptime, and MongoDB connection state
 */
router.get('/', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  sendSuccess(res, 200, 'Server is healthy', {
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    mongodb: {
      status: dbStates[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host || 'N/A',
      database: mongoose.connection.name || 'N/A',
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

module.exports = router;
