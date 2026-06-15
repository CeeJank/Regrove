require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

module.exports = app;
