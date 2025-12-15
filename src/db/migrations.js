const db = require('./index'); // better-sqlite3 instance

function runMigrations() {
  // Users table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER UNIQUE,
      per_mile_rate REAL DEFAULT 0,
      weekly_rent REAL DEFAULT 0,
      input_state TEXT DEFAULT 'IDLE'
    )
  `).run();

  // Weeks table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS weeks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER,
      start_mileage REAL,
      end_mileage REAL,
      rate REAL DEFAULT 0,
      weekly_rent REAL DEFAULT 0,
      total_miles REAL DEFAULT 0,
      mileage_amount REAL DEFAULT 0,
      total_owed REAL DEFAULT 0,
      status TEXT DEFAULT 'OPEN',
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP
    )
  `).run();

  console.log('✅ Migrations ran successfully');
}

module.exports = runMigrations;
