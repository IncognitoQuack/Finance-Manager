// services/csvImportService.js
const csv = require('csv-parser');
const fs = require('fs');
const FinanceRecord = require('../models/FinanceRecord');

/**
 * Parse and insert CSV data.
 * CSV columns might be: Title,Amount,Category,Type,Date,Notes
 */
async function importCSV(filePath, userId) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Convert row fields to match your FinanceRecord schema
        results.push({
          userId, // or handle user logic differently
          title: row.Title,
          amount: parseFloat(row.Amount),
          category: row.Category,
          type: row.Type.toLowerCase(),
          date: new Date(row.Date),
          notes: row.Notes || ''
        });
      })
      .on('end', async () => {
        try {
          // Bulk insert
          const inserted = await FinanceRecord.insertMany(results);
          resolve(inserted);
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => reject(err));
  });
}

module.exports = { importCSV };
