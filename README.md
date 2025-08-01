# DailyDiction

**DailyDiction** is a smart vocabulary booster that helps users learn a new English word every day with:
-  Synonyms & Antonyms
-  Example Sentences
-  Daily Email Reminders
-  Streak Tracking

Whether you're a student, writer, or just a word nerd — DailyDiction keeps your vocab sharp and your brain sharper.

---

## Features

-  Word of the Day fetched from API
-  Email notifications (automated daily)
-  User subscription form
-  Backend built with Node.js
-  Automated email sending using Gmail SMTP

---

## How It Works

1. Users subscribe with their email
2. Backend stores emails in JSON/DB
3. Cron job runs daily → fetches a word → sends email notification
4. Frontend displays the word with synonyms,antonyms and an Example.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js, 
- **Email:** Nodemailer, dotenv
- **Scheduler:** Node-cron
- **Database:** JSON 
- **Deployment:** Render

---

## Screenshots

<img width="1919" height="1057" alt="Screenshot 2025-07-16 100430" src="https://github.com/user-attachments/assets/01096cc9-0bdf-4fad-ab54-72e4ac762e93" />


---

## Live Site

https://daily-diction.onrender.com

---

## Contributing

Pull requests are welcome! For major changes, open an issue first.

---
