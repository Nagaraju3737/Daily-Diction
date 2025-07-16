require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// Serve the main HTML page at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'DailyDiction.html'));
});

// Load words from JSON file
const wordsPath = path.join(__dirname, "words.json");
let words = [];

try {
  const fileContent = fs.readFileSync(wordsPath, "utf8");
  words = JSON.parse(fileContent);
  console.log("✅ words.json loaded successfully!");
} catch (err) {
  console.error("❌ Failed to read or parse words.json:", err.message);
}

// Store subscribed emails (in production, use a database)
const subscribedEmails = new Set();
const subscribersFile = path.join(__dirname, 'subscribers.json');

// Load existing subscribers from file
function loadSubscribers() {
  try {
    if (fs.existsSync(subscribersFile)) {
      const data = fs.readFileSync(subscribersFile, 'utf8');
      const subscribers = JSON.parse(data);
      subscribers.forEach(email => subscribedEmails.add(email));
      console.log(`📧 Loaded ${subscribers.length} existing subscribers`);
    }
  } catch (error) {
    console.error('Error loading subscribers:', error);
  }
}

// Save subscribers to file
function saveSubscribers() {
  try {
    const subscribers = Array.from(subscribedEmails);
    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
  } catch (error) {
    console.error('Error saving subscribers:', error);
  }
}

// Load existing subscribers on startup
loadSubscribers();

// Helper: Get word of the day based on date
function getWordOfTheDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return words[dayOfYear % words.length];
}

// Simple email notification (just logs to console for now)
function sendEmailNotification(email, subject, message) {
  console.log(`📧 EMAIL NOTIFICATION:`);
  console.log(`   To: ${email}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Message: ${message}`);
  console.log(`   Time: ${new Date().toLocaleString()}`);
  console.log(`   ---`);
  
  // In a real setup, you would send actual emails here
  // For now, we just log them to the console
  return true;
}

// API Routes
app.get('/api/word-of-the-day', (req, res) => {
  res.json(getWordOfTheDay());
});

// Subscribe endpoint
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  if (subscribedEmails.has(email)) {
    return res.status(400).json({ error: 'Email already subscribed' });
  }

  try {
    // Add email to subscription list
    subscribedEmails.add(email);
    
    // Save to file
    saveSubscribers();
    
    console.log(`✅ New subscriber: ${email}`);
    
    // Send welcome notification
    sendEmailNotification(
      email, 
      '🎉 Welcome to DailyDiction!', 
      'You are now subscribed to receive daily word notifications!'
    );
    
    res.json({ 
      success: true, 
      message: 'Successfully subscribed! You will receive daily notifications.' 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
});

// Unsubscribe endpoint
app.post('/api/unsubscribe', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (subscribedEmails.has(email)) {
    subscribedEmails.delete(email);
    saveSubscribers();
    console.log(`❌ Unsubscribed: ${email}`);
    res.json({ success: true, message: 'Successfully unsubscribed' });
  } else {
    res.status(404).json({ error: 'Email not found in subscriptions' });
  }
});

app.get('/api/subscribers', (req, res) => {
  res.json({ 
    subscribers: Array.from(subscribedEmails),
    count: subscribedEmails.size 
  });
});

app.post('/api/send-daily-notifications', async (req, res) => {
  try {
    const results = [];
    console.log(`📧 Sending daily notifications to ${subscribedEmails.size} subscribers...`);
    
    for (const email of subscribedEmails) {
      const success = sendEmailNotification(
        email,
        '🌟 New Word of the Day Available!',
        'Come check out today\'s new word and learn something amazing! Visit your DailyDiction page now.'
      );
      results.push({ email, success });
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`✅ Sent notifications to ${successful} subscribers`);
    
    res.json({ 
      success: true, 
      message: `Sent notifications to ${subscribedEmails.size} subscribers`,
      results 
    });
  } catch (error) {
    console.error('Error sending daily notifications:', error);
    res.status(500).json({ error: 'Failed to send daily notifications' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('📧 Email endpoints available:');
  console.log('  POST /api/subscribe - Subscribe to daily notifications');
  console.log('  POST /api/unsubscribe - Unsubscribe from notifications');
  console.log('  GET /api/subscribers - Get all subscribers');
  console.log('  POST /api/send-daily-notifications - Send daily notifications');
}); 
