const db = require('./index');

function runMigrations() {
  // USERS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id INTEGER PRIMARY KEY,
      per_mile_rate REAL,
      state TEXT DEFAULT 'IDLE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // ACTIVE WEEK
  db.prepare(`
    CREATE TABLE IF NOT EXISTS active_week (
      telegram_id INTEGER PRIMARY KEY,
      start_odometer INTEGER NOT NULL,
      start_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // WEEKLY HISTORY
  db.prepare(`
    CREATE TABLE IF NOT EXISTS weekly_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER,
      start_odometer INTEGER,
      end_odometer INTEGER,
      miles INTEGER,
      cost REAL,
      week_start DATETIME,
      week_end DATETIME,
      payment_status TEXT DEFAULT 'OWED',
      reminder_sent INTEGER DEFAULT 0
    )
  `).run();
}

module.exports = runMigrations;
