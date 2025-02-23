// services/notifier.js
const nodemailer = require('nodemailer');

/**
 * Example: Basic email notification using nodemailer
 */
async function sendEmailNotification(toEmail, subject, text) {
  // transporter config (use your SMTP details or a service like SendGrid)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or any
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject,
    text
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Example usage:
 * - You might call this daily or on a schedule to check if budgets are exceeded
 */
async function checkBudgetsAndNotify(userId) {
  // 1) Find user budgets
  // 2) Compare with actual spending
  // 3) If over budget, call sendEmailNotification()
}

module.exports = {
  sendEmailNotification,
  checkBudgetsAndNotify
};
