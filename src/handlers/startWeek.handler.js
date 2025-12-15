const db = require('../db');

async function startWeekHandler(ctx) {
  const telegramId = ctx.from.id;
  const messageText = ctx.message.text.trim();
  const startMileage = parseInt(messageText);

  if (isNaN(startMileage)) {
    return ctx.reply('❌ Invalid number. Please enter a numeric starting mileage.');
  }

  // Check if a week is already open
  const openWeek = db.prepare(`
    SELECT * FROM weeks WHERE telegram_id = ? AND status = 'WEEK_OPEN'
  `).get(telegramId);

  if (openWeek) {
    return ctx.reply('⚠️ A week is already open. You must end it first.');
  }

  // Create new week row
  db.prepare(`
    INSERT INTO weeks (telegram_id, start_mileage, status)
    VALUES (?, ?, 'WEEK_OPEN')
  `).run(telegramId, startMileage);

  // Reset input state
  db.prepare(`UPDATE users SET input_state = NULL WHERE telegram_id = ?`).run(telegramId);

  return ctx.reply(`✅ Week started successfully!  
Starting mileage: ${startMileage}`);
}

module.exports = startWeekHandler;
