// services/notifier.js
const nodemailer = require('nodemailer');

/**
 * Send an email notification with optional HTML content.
 */
async function sendEmailNotification(toEmail, subject, text, html = '') {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or another service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject,
      text,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}`);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

/**
 * Example: check user budgets, see if they've been exceeded, and send an email if so.
 * - user: { _id, email, ... }
 * - budgets: an array of Budget objects
 * - financeRecords: an array of FinanceRecord objects
 */
async function checkBudgetsAndNotify(user, budgets, financeRecords) {
  try {
    for (const budget of budgets) {
      // Sum all expenses in the same category
      const totalSpentInCategory = financeRecords
        .filter((r) => r.type === 'expense' && r.category === budget.category)
        .reduce((sum, r) => sum + r.amount, 0);

      // If over budget, send an alert
      if (totalSpentInCategory > budget.amount) {
        const overAmount = totalSpentInCategory - budget.amount;
        const subject = `Budget Exceeded for ${budget.category}`;
        const text = `You have exceeded your ${budget.category} budget by $${overAmount.toFixed(2)}.`;
        const html = `<p>You have exceeded your <strong>${budget.category}</strong> budget by 
                      <strong>$${overAmount.toFixed(2)}</strong>.</p>`;

        await sendEmailNotification(user.email, subject, text, html);
      }
    }
  } catch (error) {
    console.error('Error checking budgets:', error);
  }
}

module.exports = {
  sendEmailNotification,
  checkBudgetsAndNotify
};
