const mongoose = require('mongoose');
const { Schema } = mongoose;

const FinanceRecordSchema = new Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['income', 'expense'], required: true },
  notes: { type: String }
});

module.exports = mongoose.model('FinanceRecord', FinanceRecordSchema);
