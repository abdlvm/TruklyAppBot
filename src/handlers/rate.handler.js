// const db = require('../db');

// function isValidRate(value) {
//   return !isNaN(value) && Number(value) > 0;
// }

// module.exports = async function rateHandler(ctx) {
//   const telegramId = ctx.from.id;
//   const text = ctx.message?.text?.trim();

//   // If no text, do nothing
//   if (!text) return false;

//   // Validate rate
//   if (!isValidRate(text)) {
//     await ctx.reply('❌ Invalid rate. Please enter a number like 0.25');
//     return false;
//   }

//   const rate = Number(text);

//   // Check if user already exists
//   const user = db
//     .prepare('SELECT * FROM users WHERE telegram_id = ?')
//     .get(telegramId);

//   if (user) {
//     // Update rate
//     db.prepare(`
//       UPDATE users
//       SET per_mile_rate = ?
//       WHERE telegram_id = ?
//     `).run(rate, telegramId);
//   } else {
//     // Insert new user
//     db.prepare(`
//       INSERT INTO users (telegram_id, per_mile_rate)
//       VALUES (?, ?)
//     `).run(telegramId, rate);
//   }

//   await ctx.reply(`✅ Per-mile rate saved: $${rate.toFixed(2)}`);

//   // IMPORTANT: tell bot this message was handled as rate
//   return true;
// };


// const db = require('../db');

// function isValidRate(value) {
//   return !isNaN(value) && Number(value) > 0 && Number(value) < 1;
// }

// module.exports = async function rateHandler(ctx) {
//   const telegramId = ctx.from.id;
//   const text = ctx.message.text.trim();

//   if (!isValidRate(text)) {
//     await ctx.reply('❌ Invalid rate. Can not be greater than 1$ Example: 0.13');
//     return;
//   }

//   const rate = Number(text);

//   db.prepare(`
//     UPDATE users
//     SET per_mile_rate = ?, input_state = 'IDLE'
//     WHERE telegram_id = ?
//   `).run(rate, telegramId);

//   await ctx.reply(`✅ Per-mile rate saved: $${rate.toFixed(2)}`);
// };

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

  await ctx.reply(`✅ Per-mile rate saved: $${rate.toFixed(2)}`);
};
