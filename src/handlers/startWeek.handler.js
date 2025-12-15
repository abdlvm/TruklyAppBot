// const db = require('../db');

// function isValidOdometer(value) {
//   return Number.isInteger(Number(value)) && Number(value) > 0;
// }

// module.exports = async function startWeekHandler(ctx) {
//   const telegramId = ctx.from.id;
//   const text = ctx.message?.text?.trim();

//   // 1. Check user exists & rate is set
//   const user = db
//     .prepare('SELECT * FROM users WHERE telegram_id = ?')
//     .get(telegramId);

//   if (!user || !user.per_mile_rate) {
//     return ctx.reply('❗ Please set your per-mile rate first.');
//   }

//   // 2. Check if week already open
//   if (user.state === 'WEEK_OPEN') {
//     return ctx.reply('⚠️ You already have an open week.');
//   }

//   // 3. If no mileage entered yet → ask
//   if (!text || text === '/startweek') {
//     return ctx.reply('📍 Enter starting odometer mileage (example: 123456)');
//   }

//   // 4. Validate odometer
//   if (!isValidOdometer(text)) {
//     return ctx.reply('❌ Invalid odometer. Enter a whole number.');
//   }

//   const startOdometer = Number(text);

//   // 5. Save active week
//   db.prepare(`
//     INSERT INTO active_week (telegram_id, start_odometer)
//     VALUES (?, ?)
//   `).run(telegramId, startOdometer);

//   // 6. Update user state
//   db.prepare(`
//     UPDATE users SET state = 'WEEK_OPEN'
//     WHERE telegram_id = ?
//   `).run(telegramId);

//   await ctx.reply(
//     `✅ Week started successfully!\nStart odometer: ${startOdometer}`
//   );
// };

const db = require('../db');

function isValidMileage(value) {
  return !isNaN(value) && Number(value) > 0;
}

module.exports = async function startWeekHandler(ctx) {
  const telegramId = ctx.from.id;
  const text = ctx.message.text.trim();

  if (!isValidMileage(text)) {
    await ctx.reply('❌ Invalid mileage. Enter odometer number.');
    return;
  }

  const mileage = Number(text);

  const openWeek = db.prepare(`
    SELECT * FROM weeks
    WHERE telegram_id = ? AND status = 'OPEN'
  `).get(telegramId);

  if (openWeek) {
    await ctx.reply('⚠️ A week is already open.');
    return;
  }

  db.prepare(`
    INSERT INTO weeks (telegram_id, start_mileage, status)
    VALUES (?, ?, 'OPEN')
  `).run(telegramId, mileage);

  db.prepare(`
    UPDATE users
    SET input_state = 'IDLE'
    WHERE telegram_id = ?
  `).run(telegramId);

  await ctx.reply(`✅ Week started at ${mileage} miles`);
};
