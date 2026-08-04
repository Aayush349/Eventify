const https = require('https');

// Backend URL to ping
const BACKEND_URL = 'https://ticket-booking-backend-pdjz.onrender.com/';

const startKeepAlive = () => {
  // Function to ping the backend
  const pingBackend = () => {
    console.log(`[${new Date().toISOString()}] Pinging backend...`);

    https.get(BACKEND_URL, (res) => {
      console.log(`[${new Date().toISOString()}] Backend ping successful - Status: ${res.statusCode}`);

      res.on('data', () => {}); // Consume response data
      res.on('end', () => {
        console.log(`[${new Date().toISOString()}] Ping completed`);
      });
    }).on('error', (err) => {
      console.error(`[${new Date().toISOString()}] Backend ping failed:`, err.message);
    });
  };

  // Ping immediately on start
  pingBackend();

  // Set up interval to ping every 5 minutes (300,000 ms)
  const interval = setInterval(pingBackend, 300000);

  console.log(`[${new Date().toISOString()}] Keep-alive service started. Pinging every 5 minutes.`);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log(`[${new Date().toISOString()}] Shutting down keep-alive service...`);
    clearInterval(interval);
  });

  process.on('SIGTERM', () => {
    console.log(`[${new Date().toISOString()}] Shutting down keep-alive service...`);
    clearInterval(interval);
  });
};

module.exports = startKeepAlive;
