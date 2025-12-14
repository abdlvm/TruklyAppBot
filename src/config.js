require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  DB_PATH: process.env.DB_PATH || './data/database.sqlite',
  TZ: process.env.TZ || 'UTC'
};
