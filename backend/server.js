require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

const fiiRoutes = require('./routes/fiiRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Render provides PORT automatically
const PORT = process.env.PORT || 5000;

// =====================================================
// 1. MIDDLEWARE
// =====================================================

// -----------------------------------------------------
// CORS
// -----------------------------------------------------

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      // (Postman, curl, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured frontend origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // During development / deployment, allow the request.
      // You can restrict this later once everything works.
      return callback(null, true);
    },

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With'
    ],

    credentials: true
  })
);

// -----------------------------------------------------
// Body parsers
// -----------------------------------------------------

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

// =====================================================
// 2. BASIC HEALTH CHECKS
// =====================================================

// -----------------------------------------------------
// Root
// -----------------------------------------------------

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    message: 'FII Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// -----------------------------------------------------
// API root
// -----------------------------------------------------

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FII Tracker API is running',

    endpoints: {
      health: '/api/status',

      fii: {
        latest: '/api/fii/latest',
        changes: '/api/fii/changes',
        history: '/api/fii/history/:company',
        trend: '/api/fii/trend',
        sectorTreemap: '/api/fii/sector-treemap'
      },

      ticker: '/api/ticker',
      mockup: '/api/mockup',

      auth: '/api/auth'
    }
  });
});

// -----------------------------------------------------
// API status
// -----------------------------------------------------

app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'API is healthy and running',
    timestamp: new Date().toISOString()
  });
});

// =====================================================
// 3. API ROUTES
// =====================================================

// -----------------------------------------------------
// Authentication
// -----------------------------------------------------

app.use('/api/auth', authRoutes);

// Backward-compatible auth route
app.use('/auth', authRoutes);

// -----------------------------------------------------
// FII routes
// -----------------------------------------------------
//
// IMPORTANT:
//
// /api/fii/latest
//          |
//          +--> fiiRoutes.js -> router.get('/latest')
//
// Therefore:
//
// /api/fii/latest
// is the correct frontend URL.
//

app.use('/api/fii', fiiRoutes);

// Backward-compatible FII routes
app.use('/fii', fiiRoutes);

// =====================================================
// 4. TICKER API
// =====================================================

// Temporary ticker endpoint
//
// If your React frontend is currently requesting:
//
// /api/ticker
//
// this prevents a 404.
//
// Replace the response later with your actual ticker
// calculation/database logic.

app.get('/api/ticker', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Ticker data connected successfully',
      data: []
    });
  } catch (error) {
    console.error('❌ Ticker Error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticker data',
      error: error.message
    });
  }
});

// =====================================================
// 5. MOCKUP API
// =====================================================

// Temporary mockup endpoint
//
// If your React frontend is requesting:
//
// /api/mockup
//
// this prevents a 404.

app.get('/api/mockup', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Mockup data connected successfully',
      data: []
    });
  } catch (error) {
    console.error('❌ Mockup Error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch mockup data',
      error: error.message
    });
  }
});

// =====================================================
// 6. CRON SCHEDULER
// =====================================================

// Run scraper at:
// 06:00 AM
// 06:00 PM
//
// Server timezone is determined by Render/container.
// If you specifically need IST, we can configure timezone.

// =====================================================
// 6. CRON SCHEDULER
// =====================================================

// Run scraper every day at 03:30 PM IST
cron.schedule(
  '50 16 * * *',
  () => {
    console.log(
      `\n[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST] ⏰ Running FII Scraper at 3:30 PM IST...`
    );

    const scriptPath = path.join(
      __dirname,
      'scraper',
      'equitymaster_scraper.py'
    );

    console.log(`🐍 Scraper path: ${scriptPath}`);

    exec(
      `python3 "${scriptPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(
            `❌ Scraper Execution Error: ${error.message}`
          );
          return;
        }

        if (stderr) {
          console.error(
            `⚠️ Scraper Stderr:\n${stderr}`
          );
        }

        if (stdout) {
          console.log(
            `✅ Scraper Output:\n${stdout}`
          );
        }
      }
    );
  },
  {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Indian Standard Time
  }
);

// =====================================================
// 7. 404 HANDLER
// =====================================================
//
// IMPORTANT:
// This MUST remain after all routes.
//

app.use((req, res) => {
  console.log(
    `❌ 404 - ${req.method} ${req.originalUrl}`
  );

  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// =====================================================
// 8. GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: err.message || 'Something went wrong'
  });
});

// =====================================================
// 9. START SERVER
// =====================================================

// IMPORTANT FOR RENDER:
// Listen on 0.0.0.0 so Render can access the server.

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('========================================');
  console.log('🚀 FII Tracker API Server Started');
  console.log('========================================');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log('');
  console.log('📊 FII Routes:');
  console.log('   GET /api/fii/latest');
  console.log('   GET /api/fii/changes');
  console.log('   GET /api/fii/history/:company');
  console.log('   GET /api/fii/trend');
  console.log('   GET /api/fii/sector-treemap');
  console.log('');
  console.log('📈 Ticker:');
  console.log('   GET /api/ticker');
  console.log('');
  console.log('🧪 Mockup:');
  console.log('   GET /api/mockup');
  console.log('');
  console.log('🔐 Auth Routes:');
  console.log('   /api/auth');
  console.log('');
  console.log('⏰ Cron: 03:30 AM & 03:30 PM');
  console.log('========================================');
  console.log('');
});