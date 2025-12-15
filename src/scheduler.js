const cron = require('node-cron');
const db = require('./db');
const { Bot } = require('grammy');
const { BOT_TOKEN } = require('./config');

const bot = new Bot(BOT_TOKEN);

// Schedule: Every Friday at 10:00 AM (server time)
cron.schedule('0 10 * * 5', () => {
  const users = db.prepare(`SELECT telegram_id FROM users`).all();

  users.forEach(user => {
    bot.api.sendMessage(user.telegram_id,
`📌 Reminder: Today is Friday!
Please pay your weekly truck rent to the owner if you have a closed week.

Use /lastweek to check last week's total owed.`
    );
  });
});

console.log('🕒 Friday reminder scheduler running');
