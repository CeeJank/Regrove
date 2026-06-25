const pool = require("../config/db");

async function waitForDatabase(maxRetries = 10) {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      console.log("Database connection is ready");
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      console.log(
        `Database not ready yet. Retrying ${attempt}/${maxRetries}...`
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

module.exports = {
  waitForDatabase,
};
