require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const pool = require('./config/db');
const { waitForDatabase } = require('./database/initDb');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint.
// GET /
// Use this to confirm the Express server is running.
app.get('/', (req, res) => {
  return res.send('Backend is running');
});

// Database connection test endpoint.
// GET /test-db
// Runs a simple SELECT NOW() query to confirm PostgreSQL is reachable.
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

// All project API routes are mounted under /api.
app.use('/api', routes);

// Central error handler for async route/controller errors.
app.use(errorHandler);

async function startServer() {
  try {
    await waitForDatabase();

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
