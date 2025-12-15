const db = require('../db');

async function endWeekHandler(ctx) {
  const telegramId = ctx.from.id;
  const messageText = ctx.message.text.trim();

  // Get open week
  const week = db.prepare(`
    SELECT * FROM weeks 
    WHERE telegram_id = ? AND status = 'WEEK_OPEN'
    ORDER BY id DESC
    LIMIT 1
  `).get(telegramId);

  if (!week) {
    return ctx.reply('⚠️ No week is currently open. Please start a week first.');
  }

  const startMileage = week.start_mileage;

  // Validate ending mileage
  const endMileage = parseInt(messageText);
  if (isNaN(endMileage)) {
    return ctx.reply('❌ Invalid number. Please enter a numeric ending mileage.');
  }
  if (endMileage <= startMileage) {
    return ctx.reply(`❌ Ending mileage must be greater than starting mileage (${startMileage}).`);
  }

  // Get user's rate and weekly rent
  const user = db.prepare(`SELECT per_mile_rate, weekly_rent FROM users WHERE telegram_id = ?`).get(telegramId);
  const rate = user?.per_mile_rate || 0;
  const weeklyRent = user?.weekly_rent || 0;

  // Calculations
  const totalMiles = endMileage - startMileage;
  const mileageAmount = totalMiles * rate;
  const totalOwed = mileageAmount + weeklyRent;

  // Update week in DB
  db.prepare(`
    UPDATE weeks
    SET end_mileage = ?, total_miles = ?, mileage_amount = ?, weekly_rent = ?, total_owed = ?, status = 'WEEK_CLOSED'
    WHERE id = ?
  `).run(endMileage, totalMiles, mileageAmount, weeklyRent, totalOwed, week.id);

  // Reset user input state
  db.prepare(`UPDATE users SET input_state = NULL WHERE telegram_id = ?`).run(telegramId);

  // Reply summary
  await ctx.reply(
`✅ Week Closed Successfully

📅 Period: Sunday → Saturday
🚩 Start Mileage: ${startMileage}
🏁 End Mileage: ${endMileage}

📏 Total Miles: ${totalMiles}
💲 Rate: $${rate.toFixed(2)}/mile
🧮 Mileage Amount: $${mileageAmount.toFixed(2)}

🏠 Weekly Truck Rent: $${weeklyRent.toFixed(2)}

💰 TOTAL OWED: $${totalOwed.toFixed(2)}

📌 You will get paid on Friday.
📌 Please pay truck rent to owner after payment.

Use /startweek to open a new week.`
  );
}

module.exports = endWeekHandler;
