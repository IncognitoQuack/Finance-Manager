// routes/budgetRoutes.js
const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

// [POST] Create new budget
router.post('/', async (req, res) => {
  try {
    // In a real app, you'd get userId from auth middleware (req.user._id)
    const { userId, category, amount, period, startDate, endDate } = req.body;

    const newBudget = new Budget({
      userId,
      category,
      amount,
      period,
      startDate,
      endDate
    });

    await newBudget.save();
    return res.json({ success: true, data: newBudget });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, error: error.message });
  }
});

// [GET] Retrieve budgets for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const budgets = await Budget.find({ userId });
    return res.json({ success: true, data: budgets });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

// [PUT] Update a budget
router.put('/:budgetId', async (req, res) => {
  try {
    const { budgetId } = req.params;
    const updated = await Budget.findByIdAndUpdate(budgetId, req.body, { new: true });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

// [DELETE] Delete a budget
router.delete('/:budgetId', async (req, res) => {
  try {
    const { budgetId } = req.params;
    await Budget.findByIdAndDelete(budgetId);
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

module.exports = router;
