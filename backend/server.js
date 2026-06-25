<<<<<<< HEAD
const path = require('path');

// Load environment variables from .env before anything else
=======
>>>>>>> 8df2b36 (Add AI chat box backend and testing frontend structure)
require('dotenv').config();

// ─── Startup Guard ────────────────────────────────────────────────────────────
// JWT_SECRET is required for all authentication to work.
// Failing here immediately prevents the server from running in an insecure state
// rather than silently allowing unsigned tokens or falling back to a weak default.
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required but not set.');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
<<<<<<< HEAD
const http = require('http');

=======
const pool = require('./config/db');
>>>>>>> 8df2b36 (Add AI chat box backend and testing frontend structure)

const app = express();
const PORT = process.env.PORT || 5000;

// Allow cross-origin requests from the React frontend (Vite dev server or production build)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

<<<<<<< HEAD
// Mount all API routes under the /api prefix
=======
app.get('/', (req, res) => {
  return res.send('Backend is running');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    return res.json({
      message: 'Database connected',
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database test failed:', error.message);

    return res.status(500).json({
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

>>>>>>> 8df2b36 (Add AI chat box backend and testing frontend structure)
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// Export app for testing purposes
module.exports = app;
