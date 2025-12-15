const { Bot } = require('grammy');
const db = require('./db');
const { BOT_TOKEN } = require('./config');
const runMigrations = require('./db/migrations');

const rateHandler = require('./handlers/rate.handler');
const startWeekHandler = require('./handlers/startWeek.handler');

runMigrations();

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is missing in .env');
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

/**
 * /start
 */
bot.command('start', async (ctx) => {
  const telegramId = ctx.from.id;

  db.prepare(`
    INSERT OR IGNORE INTO users (telegram_id, input_state)
    VALUES (?, 'EXPECT_RATE')
  `).run(telegramId);

  db.prepare(`
    UPDATE users SET input_state = 'EXPECT_RATE'
    WHERE telegram_id = ?
  `).run(telegramId);

  await ctx.reply(
`🚚 Welcome to TruklyAppBot

Please enter your per-mile rate.
Example: 0.25`
  );
});

/**
 * /rate
 */
bot.command('rate', async (ctx) => {
  const telegramId = ctx.from.id;

  const openWeek = db.prepare(`
    SELECT id FROM weeks
    WHERE telegram_id = ? AND status = 'OPEN'
  `).get(telegramId);

  if (openWeek) {
    await ctx.reply('❌ You cannot change rate while a week is open.');
    return;
  }

  db.prepare(`
    UPDATE users
    SET input_state = 'EXPECT_RATE'
    WHERE telegram_id = ?
  `).run(telegramId);

  await ctx.reply('Enter your per-mile rate (example: 13 = $0.13)');
});

// bot.command('rate', async (ctx) => {
//   db.prepare(`
//     UPDATE users SET input_state = 'EXPECT_RATE'
//     WHERE telegram_id = ?
//   `).run(ctx.from.id);

//   await ctx.reply('Enter your per-mile rate (example: 0.13)');
// });

/**
 * /startweek
 */
bot.command('startweek', async (ctx) => {
  db.prepare(`
    UPDATE users SET input_state = 'EXPECT_START_MILEAGE'
    WHERE telegram_id = ?
  `).run(ctx.from.id);

  await ctx.reply('Enter starting odometer mileage 🚩:');
});

/**
 * Handle numeric input by state
 */
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();
  if (text.startsWith('/')) return;

  const user = db.prepare(`
    SELECT * FROM users WHERE telegram_id = ?
  `).get(ctx.from.id);

  if (!user) {
    await ctx.reply('Please use /start first');
    return;
  }

  if (user.input_state === 'EXPECT_RATE') {
    await rateHandler(ctx);
    return;
  }

  if (user.input_state === 'EXPECT_START_MILEAGE') {
    await startWeekHandler(ctx);
    return;
  }

  await ctx.reply('ℹ️ Use /rate or /startweek');
});

bot.start();
console.log('🤖 TruklyAppBot running');

bot.catch((err) => {
  console.error('BOT ERROR:', err);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, stopping bot...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, stopping bot...');
  await bot.stop();
  process.exit(0);
});
