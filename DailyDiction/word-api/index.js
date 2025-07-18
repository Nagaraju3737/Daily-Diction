const cron = require('node-cron');
const path = require('path');
require('./server');
const { sendDailyEmails } = require('./sendDailyEmails');
cron.schedule('30 3 * * *', async () => {
  console.log('Running scheduled daily email');
  await sendDailyEmails();
});
console.log('✅ DailyDiction automation started. Server running and daily email job scheduled.'); 
