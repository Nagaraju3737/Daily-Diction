require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Check if email credentials are properly configured
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.error('❌ Email credentials not found!');
  process.exit(1);
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// Test email configuration
async function testEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    console.error('');
    return false;
  }
}

// Load subscribed emails (in production, use a database)
// For now, we'll store them in a simple JSON file
const subscribersFile = path.join(__dirname, 'subscribers.json');

function loadSubscribers() {
  try {
    if (fs.existsSync(subscribersFile)) {
      const data = fs.readFileSync(subscribersFile, 'utf8');
      const subscribers = JSON.parse(data);
      console.log(`📧 Loaded ${subscribers.length} subscribers from ${subscribersFile}`);
      return subscribers;
    } else {
      console.log(`📭 No subscribers file found at ${subscribersFile}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error loading subscribers:', error);
    return [];
  }
}

function saveSubscribers(subscribers) {
  try {
    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
    console.log(`💾 Saved ${subscribers.length} subscribers to ${subscribersFile}`);
  } catch (error) {
    console.error('❌ Error saving subscribers:', error);
  }
}

// Send daily reminder email
async function sendDailyReminder(email) {
  const mailOptions = {
    from: emailUser,
    to: email,
    subject: 'New Word of the Day Available!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">📚 DailyDiction</h1>
          <h2 style="color: #4CAF50; text-align: center; margin-bottom: 30px;">Ready to Learn Something New?</h2>
          
          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="font-size: 18px; color: #333; margin-bottom: 15px;">
              🎯 A fresh word of the day is waiting for you!
            </p>
            <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
              Expand your vocabulary and discover new ways to express yourself with today's carefully selected word.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://daily-diction.onrender.com" style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
            Check Out Today's Word
            </a>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              💡 <strong>Did you know?</strong> Learning just one new word a day can significantly improve your vocabulary and communication skills over time!
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p>You're receiving this email because you subscribed to DailyDiction.</p>
            <p>To unsubscribe, reply with "UNSUBSCRIBE" in the subject line.</p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Daily reminder sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    return false;
  }
}

// Main function to send daily emails
async function sendDailyEmails() {
  console.log('📧 Starting daily email sending...');
  console.log(`📁 Working directory: ${process.cwd()}`);
  console.log(`📁 Subscribers file: ${subscribersFile}`);
  
  // Test email configuration first
  console.log('🔧 Testing email configuration...');
  const emailConfigValid = await testEmailConfig();
  if (!emailConfigValid) {
    console.error('❌ Email configuration is invalid. Please fix the issues above and try again.');
    return;
  }
  
  const subscribers = loadSubscribers();
  
  if (subscribers.length === 0) {
    console.log('📭 No subscribers found. Skipping email sending.');
    return;
  }
  
  console.log(`📬 Sending emails to ${subscribers.length} subscribers...`);
  
  const results = [];
  for (const email of subscribers) {
    const success = await sendDailyReminder(email);
    results.push({ email, success });
    
    // Add a small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`📊 Email sending completed:`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('❌ Failed emails:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.email}`);
    });
  }
}

// Run the script
if (require.main === module) {
  sendDailyEmails()
    .then(() => {
      console.log('🎉 Daily email sending completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error sending daily emails:', error);
      process.exit(1);
    });
}

module.exports = { sendDailyEmails, loadSubscribers, saveSubscribers }; 
