const express = require('express');
const router = express.Router();
const FinanceRecord = require('../models/FinanceRecord');

// PDF generation
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/* -------------------------
   1) CREATE a new record
-------------------------- */
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, type, notes } = req.body;
    const record = new FinanceRecord({ title, amount, category, date, type, notes });
    await record.save();
    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------
   2) READ all records
-------------------------- */
router.get('/', async (req, res) => {
  try {
    const records = await FinanceRecord.find().sort({ date: -1 });
    return res.json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------
   3) UPDATE a record by ID
-------------------------- */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRecord = await FinanceRecord.findByIdAndUpdate(id, req.body, {
      new: true
    });
    return res.json({ success: true, data: updatedRecord });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------
   4) DELETE a record by ID
-------------------------- */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await FinanceRecord.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------
   5) EXPORT data as JSON
-------------------------- */
router.get('/export/json', async (req, res) => {
  try {
    const records = await FinanceRecord.find();
    const jsonData = JSON.stringify(records, null, 2);

    res.setHeader('Content-disposition', 'attachment; filename=financeData.json');
    res.setHeader('Content-type', 'application/json');
    return res.send(jsonData);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------
   6) IMPORT data from JSON
-------------------------- */
router.post('/import/json', async (req, res) => {
  try {
    const jsonData = req.body;
    if (!Array.isArray(jsonData)) {
      return res.status(400).json({ success: false, message: 'Invalid JSON data' });
    }
    const inserted = await FinanceRecord.insertMany(jsonData);
    return res.json({ success: true, data: inserted });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------
   7) GENERATE PDF REPORT
-------------------------- */
router.get('/report/pdf', async (req, res) => {
  try {
    const records = await FinanceRecord.find().sort({ date: 1 });

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `Finance_Report_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '..', 'public', fileName);

    // Pipe PDF to a write stream
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // PDF Title
    doc.fontSize(20).text('Personal Finance Report', { align: 'center' });
    doc.moveDown(2);

    // Simple listing
    records.forEach((record) => {
      doc.fontSize(12).text(`Title: ${record.title}`, { continued: true })
        .text(`  |  Amount: $${record.amount}`);
      doc.text(`Category: ${record.category}  |  Type: ${record.type}`);
      doc.text(`Date: ${record.date.toDateString()}`);
      doc.text(`Notes: ${record.notes || 'N/A'}`);
      doc.moveDown();
    });

    doc.end();

    // When finished writing, send the file to the user
    stream.on('finish', () => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        // Clean up file after sending
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
