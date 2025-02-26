// services/aiCategorize.js

// Define categories and keywords
const categoryKeywords = {
  Groceries: ['grocery', 'supermarket', 'aldi', 'walmart', 'food', 'market'],
  Housing: ['rent', 'mortgage', 'apartment', 'lease'],
  Utilities: ['electric', 'water', 'gas', 'internet', 'phone', 'utility'],
  Transport: ['uber', 'taxi', 'bus', 'train', 'fuel', 'gas station'],
  Entertainment: ['movie', 'cinema', 'netflix', 'concert', 'theater'],
  Health: ['doctor', 'hospital', 'pharmacy', 'medicine', 'clinic'],
  Education: ['school', 'college', 'tuition', 'books'],
  Dining: ['restaurant', 'dine', 'dinner', 'lunch', 'breakfast'],
  // Add more categories and keywords as needed
};

function autoCategorize(record) {
  // Combine title + notes into one searchable string
  const text = (record.title + ' ' + (record.notes || '')).toLowerCase();

  let bestCategory = 'Other';
  let maxScore = 0;

  // Check each category’s keywords
  for (const category in categoryKeywords) {
    const keywords = categoryKeywords[category];
    let score = 0;

    // Count how many keywords match
    keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        score++;
      }
    });

    // Pick the category with the highest keyword hits
    if (score > maxScore) {
      bestCategory = category;
      maxScore = score;
    }
  }

  return bestCategory;
}

module.exports = { autoCategorize };
