const path = require('path');

// Load environment variables from .env before anything else
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

// Central route index — all /api/* routes are registered there
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow cross-origin requests from the React frontend (Vite dev server or production build)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Mount all API routes under the /api prefix
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// Export app for testing purposes
module.exports = app;
