// routes/financeRoutes.js
// FULL UPDATED CODE (NO REMOVALS, ONLY REPLACING DUMMY DATA WITH REAL USER DATA FOR PDF CHARTS)

const express = require('express');
const router = express.Router();
const FinanceRecord = require('../models/FinanceRecord');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

/* -------------------------------------------------
   CREATE a new record
-------------------------------------------------- */
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, type, notes } = req.body;
    const newRecord = new FinanceRecord({
      title,
      amount,
      category,
      date: date || Date.now(),
      type,
      notes
    });
    const savedRecord = await newRecord.save();
    return res.status(201).json({ success: true, data: savedRecord });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------
   READ all records
-------------------------------------------------- */
router.get('/', async (req, res) => {
  try {
    const records = await FinanceRecord.find().sort({ date: -1 });
    return res.json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------
   UPDATE a record by ID
-------------------------------------------------- */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRecord = await FinanceRecord.findByIdAndUpdate(id, req.body, {
      new: true
    });
    if (!updatedRecord) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    return res.json({ success: true, data: updatedRecord });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------
   DELETE a record by ID
-------------------------------------------------- */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecord = await FinanceRecord.findByIdAndDelete(id);
    if (!deletedRecord) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    return res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------
   EXPORT data as JSON
-------------------------------------------------- */
router.get('/export/json', async (req, res) => {
  try {
    const records = await FinanceRecord.find();
    const jsonData = JSON.stringify(records, null, 2);

    res.setHeader('Content-Disposition', 'attachment; filename="financeData.json"');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(jsonData);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------
   IMPORT data from JSON
-------------------------------------------------- */
router.post('/import/json', async (req, res) => {
  try {
    const jsonData = req.body;
    if (!Array.isArray(jsonData)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON data (must be an array).'
      });
    }
    const insertedRecords = await FinanceRecord.insertMany(jsonData);
    return res.json({ success: true, data: insertedRecords });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------
   GENERATE PDF REPORT (Enhanced - Now uses real data)
-------------------------------------------------- */
router.get('/report/pdf', async (req, res) => {
  try {
    const records = await FinanceRecord.find().sort({ date: 1 });

    // Basic calculations
    const totalIncome = records
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // 1) Bar Chart: Group by Category and show total amounts
    const categories = [...new Set(records.map((r) => r.category))];
    const categoryTotals = categories.map((cat) =>
      records.filter((r) => r.category === cat).reduce((sum, r) => sum + r.amount, 0)
    );

    const width = 600;
    const height = 300;
    const chartCanvas = new ChartJSNodeCanvas({ width, height });

    const productChartConfig = {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Category Totals',
            data: categoryTotals,
            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#66BB6A', '#FFA726']
          }
        ]
      }
    };
    const productChartImage = await chartCanvas.renderToBuffer(productChartConfig);

    // 2) Line Chart: Monthly Totals (sum of amounts by month)
    const monthlyMap = {};
    records.forEach((rec) => {
      if (!rec.date) return;
      const d = new Date(rec.date);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      if (!monthlyMap[key]) monthlyMap[key] = 0;
      monthlyMap[key] += rec.amount;
    });

    const sortedKeys = Object.keys(monthlyMap).sort((a, b) => {
      const [ma, ya] = a.split('/').map(Number);
      const [mb, yb] = b.split('/').map(Number);
      return new Date(ya, ma - 1) - new Date(yb, mb - 1);
    });

    const forecastLabels = sortedKeys;
    const forecastSales = sortedKeys.map((k) => monthlyMap[k]);

    const forecastChartConfig = {
      type: 'line',
      data: {
        labels: forecastLabels,
        datasets: [
          {
            label: 'Monthly Totals',
            data: forecastSales,
            fill: false,
            borderColor: '#4caf50',
            tension: 0.1
          }
        ]
      }
    };
    const forecastChartImage = await chartCanvas.renderToBuffer(forecastChartConfig);

    // Create PDF
    const doc = new PDFDocument({ margin: 40 });
    const fileName = `Finance_Report_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '..', 'public', fileName);

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header Section
    doc
      .fillColor('#2c3e50')
      .fontSize(20)
      .text('Summary of Business Management Monthly Financial Report', {
        align: 'center',
        underline: false
      });
    doc.moveDown(1);

    // Intro Paragraph
    doc
      .fillColor('#555')
      .fontSize(12)
      .text(
        'This report provides an overview of monthly financial performance, risk management action items, budget usage, and future sales forecasts.'
      );
    doc.moveDown(1);

    // Financial Overview Box
    doc.rect(doc.x, doc.y, 520, 70).fill('#f5f5f5').stroke('#ccc');
    doc.moveDown(0.2);

    const boxStartY = doc.y - 70;
    const boxStartX = doc.x;
    doc
      .fillColor('#333')
      .fontSize(14)
      .text(`Total Income: $${totalIncome.toFixed(2)}`, boxStartX + 10, boxStartY + 10);
    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, { lineBreak: true });
    doc.text(`Net Balance: $${netBalance.toFixed(2)}`, { lineBreak: true });
    doc.moveDown(3);

    // Risk Management Action Items
    doc
      .fillColor('#2c3e50')
      .fontSize(14)
      .text('Risk Management Action Items', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor('#000');
    const actionItems = [
      {
        issue: 'Weak Branding',
        action: 'Meet with design team to discuss rebranding',
        owner: 'John Doe',
        targetDate: '02/06/2025'
      },
      {
        issue: 'Accessing the latest technology',
        action: 'Evaluate new software solutions',
        owner: 'Jane Smith',
        targetDate: '03/01/2025'
      }
    ];
    doc.text('Issue | Action | Owner | Target Date');
    doc.moveDown(0.3);
    actionItems.forEach((item) => {
      doc.text(`${item.issue} | ${item.action} | ${item.owner} | ${item.targetDate}`);
    });
    doc.moveDown(1);

    // Monthly Expense and Budget Report
    doc
      .fillColor('#2c3e50')
      .fontSize(14)
      .text('Monthly Expense and Budget Report (In US$)', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor('#000');
    doc.text('Budget Category | Planned | Actual | Difference');
    doc.moveDown(0.3);
    const budgetTable = [
      { category: 'Utilities', planned: 300, actual: 350 },
      { category: 'Marketing', planned: 500, actual: 400 },
      { category: 'Maintenance', planned: 200, actual: 250 },
      { category: 'Miscellaneous', planned: 100, actual: 80 }
    ];
    budgetTable.forEach((row) => {
      const diff = row.planned - row.actual;
      doc.text(
        `${row.category} | $${row.planned.toFixed(2)} | $${row.actual.toFixed(
          2
        )} | $${diff.toFixed(2)}`
      );
    });
    doc.moveDown(1);

    // Insert Bar Chart (Category Totals)
    doc
      .fillColor('#2c3e50')
      .fontSize(14)
      .text('Monthly Product Sales', { underline: true });
    doc.moveDown(0.5);
    doc.image(productChartImage, { fit: [500, 300], align: 'center' });
    doc.moveDown(2);

    // Insert Line Chart (Monthly Totals)
    doc
      .fillColor('#2c3e50')
      .fontSize(14)
      .text('Sales Forecast for Coming Months', { underline: true });
    doc.moveDown(0.5);
    doc.image(forecastChartImage, { fit: [500, 300], align: 'center' });
    doc.moveDown(2);

    // Detailed Finance Records
    doc
      .fillColor('#2c3e50')
      .fontSize(14)
      .text('Detailed Finance Records', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor('#000');
    doc.text('Title | Amount | Category | Type | Date | Notes');
    doc.moveDown(0.3);

    records.forEach((record) => {
      const dateStr = record.date ? record.date.toDateString() : 'N/A';
      const rowText = `${record.title} | $${record.amount} | ${record.category} | ${record.type} | ${dateStr} | ${
        record.notes || 'N/A'
      }`;
      doc.text(rowText);
    });

    doc.end();
    stream.on('finish', () => {
      res.download(filePath, fileName, (err) => {
        if (err) console.error('Error downloading file:', err);
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
