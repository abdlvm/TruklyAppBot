const db = require('../db');

async function lastWeekHandler(ctx) {
  const telegramId = ctx.from.id;

  // Get last closed week
  const lastWeek = db.prepare(`
    SELECT * FROM weeks 
    WHERE telegram_id = ? AND status = 'WEEK_CLOSED'
    ORDER BY id DESC
    LIMIT 1
  `).get(telegramId);

  if (!lastWeek) {
    return ctx.reply('⚠️ No closed weeks found yet.');
  }

  const {
    start_mileage,
    end_mileage,
    total_miles,
    mileage_amount,
    weekly_rent,
    total_owed
  } = lastWeek;

  await ctx.reply(
`📊 Last Week Summary

🚛 Start Mileage: ${start_mileage}
🏁 End Mileage: ${end_mileage}
📏 Total Miles: ${total_miles}
💲 Rate: $${(mileage_amount / total_miles || 0).toFixed(2)} / mile
🧮 Mileage Amount: $${mileage_amount.toFixed(2)}
🏠 Weekly Truck Rent: $${weekly_rent.toFixed(2)}
💰 TOTAL OWED: $${total_owed.toFixed(2)}`
  );
}

module.exports = lastWeekHandler;
