const { Bot } = require('grammy');
const { BOT_TOKEN } = require('./config');
const runMigrations = require('./db/migrations');
const rateHandler = require('./handlers/rate.handler');

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is missing');
  process.exit(1);
}

// Run DB migrations
runMigrations();

// Create bot
const bot = new Bot(BOT_TOKEN);

/**
 * /start command
 */
bot.command('start', async (ctx) => {
  await ctx.reply(
`🚚 Welcome to TruklyAppBot

Please enter your per-mile rate.
Example: 0.13$`
  );
});

/**
 * /rate command (reset rate)
 */
bot.command('rate', async (ctx) => {
  await ctx.reply('Please enter your per-mile rate (example: 0.13)');
});

/**
 * Handle text messages (rate only)
 */
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();

  // Ignore commands
  if (text.startsWith('/')) return;

  await rateHandler(ctx);
});

/**
 * Start bot
 */
bot.start();
console.log('🤖 TruklyAppBot is running');
