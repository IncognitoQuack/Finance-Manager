// services/aiCategorize.js

/**
 * Example naive approach:
 * - If title or notes contain certain keywords -> guess category
 * - Real version might use a trained model or a third-party service
 */
function autoCategorize(record) {
    const title = record.title.toLowerCase();
  
    if (title.includes('grocery') || title.includes('supermarket')) {
      return 'Groceries';
    }
    if (title.includes('rent') || title.includes('mortgage')) {
      return 'Housing';
    }
    if (title.includes('uber') || title.includes('taxi')) {
      return 'Transport';
    }
    // fallback
    return 'Other';
  }
  
  module.exports = { autoCategorize };
  