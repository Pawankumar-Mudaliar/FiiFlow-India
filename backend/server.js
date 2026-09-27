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

// ==========================================
// 1. MIDDLEWARE (MUST BE AT THE VERY TOP)
// ==========================================

// Enable CORS for your React frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Allow Express to parse incoming JSON data from forms
app.use(express.json());


// ==========================================
// 2. API ROUTES (MUST COME AFTER MIDDLEWARE)
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/fii', fiiRoutes);


// ==========================================
// 3. HEALTH CHECK & SCHEDULER
// ==========================================
app.get('/api/status', (req, res) => {
  res.json({ status: 'API is healthy and running' });
});

// Automated scraper execution (6:00 AM & 6:00 PM)
cron.schedule('0 6,18 * * *', () => {
  console.log(`\n[${new Date().toLocaleString()}] ⏰ Running FII Scraper...`);
  const scriptPath = path.join(__dirname, 'scraper', 'equitymaster_scraper.py');
  
  exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Scraper Execution Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ Scraper Stderr:\n${stderr}`);
    }
    console.log(`✅ Scraper Output:\n${stdout}`);
  });
});


// ==========================================
// 4. START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log('⏱️  Cron scheduler active for 6:00 AM and 6:00 PM.');
});