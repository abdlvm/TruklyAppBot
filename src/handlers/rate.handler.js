const db = require('../db');

function parseRate(input) {
  const clean = input.toLowerCase().replace(/[^0-9.]/g, '');
  if (!clean) return null;

  let rate = Number(clean);
  if (isNaN(rate) || rate <= 0) return null;

  if (rate > 1) {
    rate = rate / 100;
  }

  if (rate > 1) return null;

  return Number(rate.toFixed(2));
}

module.exports = async function rateHandler(ctx) {
  const telegramId = ctx.from.id;
  const text = ctx.message.text.trim();

  const rate = parseRate(text);
  if (rate === null) {
    await ctx.reply(
      '❌ Invalid rate.\n\nExamples:\n• 25  → $0.25\n• 0.30 → $0.30\n• 50c → $0.50'
    );
    return;
  }

  db.prepare(`
    UPDATE users
    SET per_mile_rate = ?, input_state = 'IDLE'
    WHERE telegram_id = ?
  `).run(rate, telegramId);

  await ctx.reply(`✅ Per-mile rate saved: $${rate.toFixed(2)}/mile`);
};
