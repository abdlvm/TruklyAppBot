const { Bot, Keyboard } = require('grammy');
const db = require('./db'); // your better-sqlite3 instance
const { BOT_TOKEN } = require('./config');
const runMigrations = require('./db/migrations');

// Handlers
const rateHandler = require('./handlers/rate.handler');
const rentHandler = require('./handlers/rent.handler');
const startWeekHandler = require('./handlers/startWeek.handler');
const endWeekHandler = require('./handlers/endWeek.handler');
const lastWeekHandler = require('./handlers/lastWeek.handler');


if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN missing');
  process.exit(1);
}

// Run migrations
runMigrations();

// Create bot
const bot = new Bot(BOT_TOKEN);
require('./scheduler'); // starts Friday reminder


// ===== /start command =====
bot.command('start', async (ctx) => {
  const telegramId = ctx.from.id;

  // Insert user if not exists
  db.prepare(`
    INSERT OR IGNORE INTO users (telegram_id, input_state)
    VALUES (?, NULL)
  `).run(telegramId);

  // Reply keyboard
  const keyboard = new Keyboard()
    // First row: 2 buttons
  .text('Set Rate 💲').text('Set Weekly Rent 🚛').row()
  // Second row: 2 buttons
  .text('Start Week 🚩').text('End Week 🏁').row()
  // Third row: 2 buttons
  .text('Last Week 📊').text('Help ❓');

  await ctx.reply(
`🚚 Welcome to TruklyAppBot

Use the buttons below to navigate.`,
    { reply_markup: keyboard }
  );
});

// ===== Button / Text router =====
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  const telegramId = ctx.from.id;

  const user = db.prepare(`SELECT * FROM users WHERE telegram_id = ?`).get(telegramId);
  if (!user) return ctx.reply('Please start with /start');

  switch (text) {
    case 'Set Rate 💲':
      db.prepare(`UPDATE users SET input_state = 'EXPECT_RATE' WHERE telegram_id = ?`).run(telegramId);
      return ctx.reply('Enter per-mile rate (example: 0.13)');
    case 'Set Weekly Rent 🚛':
      db.prepare(`UPDATE users SET input_state = 'EXPECT_WEEKLY_RENT' WHERE telegram_id = ?`).run(telegramId);
      return ctx.reply('Enter weekly truck rent (example: 850)');
    case 'Start Week 🚩':
      db.prepare(`UPDATE users SET input_state = 'EXPECT_START_MILEAGE' WHERE telegram_id = ?`).run(telegramId);
      return ctx.reply('Enter starting odometer mileage:');
    case 'End Week 🏁':
      db.prepare(`UPDATE users SET input_state = 'EXPECT_END_MILEAGE' WHERE telegram_id = ?`).run(telegramId);
      return ctx.reply('Enter ending odometer mileage:');
    case 'Last Week 📊':
      return lastWeekHandler(ctx);
    case 'Help ❓':
      return ctx.reply('Feature coming soon!');
    default:
      // fallback to typed input_state
      switch (user.input_state) {
        case 'EXPECT_RATE':
          return rateHandler(ctx);
        case 'EXPECT_WEEKLY_RENT':
          return rentHandler(ctx);
        case 'EXPECT_START_MILEAGE':
          return startWeekHandler(ctx);
        case 'EXPECT_END_MILEAGE':
          return endWeekHandler(ctx);
        default:
          return ctx.reply('ℹ️ Use buttons or commands to navigate.');
      }
  }
});

// ===== Error handler =====
bot.catch((err) => console.error('🤖 Bot error:', err));

// ===== Start bot =====
bot.start();
console.log('🤖 TruklyAppBot is running');

// ===== Graceful shutdown =====
process.on('SIGINT', async () => { await bot.stop(); process.exit(0); });
process.on('SIGTERM', async () => { await bot.stop(); process.exit(0); });
