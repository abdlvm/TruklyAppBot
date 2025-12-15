const db = require('../db');

function isValidAmount(value) {
  return !isNaN(value) && Number(value) > 0;
}

module.exports = async function rentHandler(ctx) {
  const telegramId = ctx.from.id;
  const text = ctx.message.text.trim();

  if (!isValidAmount(text)) {
    await ctx.reply('❌ Invalid rent amount. Example: 850');
    return;
  }

  const rent = Number(text);

  const openWeek = db.prepare(`
    SELECT id FROM weeks
    WHERE telegram_id = ? AND status = 'OPEN'
  `).get(telegramId);

  if (openWeek) {
    await ctx.reply('❌ Cannot change weekly rent while a week is open.');
    return;
  }

  db.prepare(`
    UPDATE users
    SET weekly_rent = ?, input_state = 'IDLE'
    WHERE telegram_id = ?
  `).run(rent, telegramId);

  await ctx.reply(`✅ Weekly truck rent saved: $${rent.toFixed(2)}`);
};
