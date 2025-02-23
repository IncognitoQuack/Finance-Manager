// models/Budget.js
const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or you can store a simple string if no real user system
    required: true
  },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  period: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  // you could store the year/month if you want specific monthly budgets
  // or store "startDate" / "endDate" for a custom range
  startDate: Date,
  endDate: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Budget', BudgetSchema);
