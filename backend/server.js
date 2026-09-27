
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

const fiiRoutes = require('./routes/fiiRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// 1. MIDDLEWARE
// =====================================================

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Parse JSON requests
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// =====================================================
// 2. ROUTES
// =====================================================

// Authentication routes
// Example:
// POST /api/auth/login
// POST /api/auth/register
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// FII routes
// IMPORTANT:
// Your React frontend calls:
// GET /fii/latest
//
// So the router is mounted at /fii.
//
// Available routes:
// GET /fii/latest
// GET /fii/changes
// GET /fii/history/:company
// GET /fii/trend
// GET /fii/sector-treemap
app.use('/fii', fiiRoutes);

// =====================================================
// 3. HEALTH CHECK
// =====================================================

// Basic health check
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'FII Tracker API is running',
  });
});

// API status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'API is healthy and running',
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// 4. CRON SCHEDULER
// =====================================================

// Run scraper at:
// 06:00 AM
// 06:00 PM
cron.schedule('0 6,18 * * *', () => {
  console.log(
    `\n[${new Date().toLocaleString()}] ⏰ Running FII Scraper...`
  );

  const scriptPath = path.join(
    __dirname,
    'scraper',
    'equitymaster_scraper.py'
  );

  exec(`python3 "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Scraper Execution Error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`⚠️ Scraper Stderr:\n${stderr}`);
    }

    if (stdout) {
      console.log(`✅ Scraper Output:\n${stdout}`);
    }
  });
});

// =====================================================
// 5. 404 HANDLER
// =====================================================

// This will run only when no route matches
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// =====================================================
// 6. GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(500).json({
    error: 'Internal server error',
  });
});

// =====================================================
// 7. START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 FII Tracker API Server Started');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log('========================================');
  console.log('📊 FII Routes:');
  console.log('   GET /fii/latest');
  console.log('   GET /fii/changes');
  console.log('   GET /fii/history/:company');
  console.log('   GET /fii/trend');
  console.log('   GET /fii/sector-treemap');
  console.log('========================================');
  console.log('🔐 Auth Routes:');
  console.log('   /api/auth');
  console.log('========================================');
  console.log('⏰ Cron: 06:00 AM & 06:00 PM');
  console.log('========================================');
});