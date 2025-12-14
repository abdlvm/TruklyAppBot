const db = require('../db');

function isValidRate(value) {
  return !isNaN(value) && Number(value) > 0;
}

module.exports = async function rateHandler(ctx) {
  const telegramId = ctx.from.id;
  const text = ctx.message.text.trim();

  if (!isValidRate(text)) {
    return ctx.reply('❌ Invalid rate. Please enter a number like 0.13');
  }

  const rate = Number(text);

  const user = db
    .prepare('SELECT * FROM users WHERE telegram_id = ?')
    .get(telegramId);

  if (user) {
    db.prepare(
      'UPDATE users SET per_mile_rate = ? WHERE telegram_id = ?'
    ).run(rate, telegramId);
  } else {
    db.prepare(
      'INSERT INTO users (telegram_id, per_mile_rate) VALUES (?, ?)'
    ).run(telegramId, rate);
  }

  await ctx.reply(`✅ Per-mile rate saved: $${rate.toFixed(2)}`);
};
