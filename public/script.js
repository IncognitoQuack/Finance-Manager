// script.js (FULL UPDATED CODE)

const API_BASE = '/api/finance';
let financeData = [];
let financeChart;
let financeChart2;

document.addEventListener('DOMContentLoaded', async () => {
  await fetchRecords();

  document.getElementById('finance-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('export-json-btn').addEventListener('click', () => {
    window.location.href = `${API_BASE}/export/json`;
  });

  const importBtn = document.getElementById('import-json-btn');
  const importFile = document.getElementById('import-json-file');
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', handleImportJSON);
  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('import-filename').textContent = `Selected file: ${file.name}`;
    }
  });

  document.getElementById('pdf-report-btn').addEventListener('click', () => {
    window.location.href = `${API_BASE}/report/pdf`;
  });

  document.getElementById('apply-filters-btn').addEventListener('click', applyFilters);
  document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);

  document.querySelectorAll('#finance-table thead th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => handleSort(th.getAttribute('data-sort')));
  });

  const closeModalBtn = document.querySelector('.close-modal');
  closeModalBtn.addEventListener('click', closeEditModal);
  document.getElementById('edit-form').addEventListener('submit', handleEditSubmit);

  const themeSwitch = document.getElementById('theme-switch');
  themeSwitch.addEventListener('change', toggleTheme);
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeSwitch.checked = true;
  }

  document.getElementById('calc-btn').addEventListener('click', handleAnalytics);

  // New Calculations event listeners
  document.getElementById('calc-irr-btn').addEventListener('click', handleCalcIRR);
  document.getElementById('calc-fv-btn').addEventListener('click', handleCalcFV);
  document.getElementById('calc-sip-btn').addEventListener('click', handleCalcSIP);
  document.getElementById('calc-withdraw-btn').addEventListener('click', handleCalcWithdraw);
});

console.log("A Software by IncognitoQuack");

/* -------------------------
   Fetch All Records
-------------------------- */
async function fetchRecords() {
  try {
    const res = await fetch(API_BASE);
    const json = await res.json();
    if (json.success) {
      financeData = json.data;
      renderTable(financeData);
      updateSummary(financeData);
      renderCategoryChart(financeData);
      renderMonthlyChart(financeData);
    } else {
      console.error(json.error);
    }
  } catch (error) {
    console.error('Error fetching records:', error);
  }
}

/* -------------------------
   Render Table
-------------------------- */
function renderTable(data) {
  const tbody = document.querySelector('#finance-table tbody');
  tbody.innerHTML = '';

  data.forEach((record) => {
    const tr = document.createElement('tr');
    const dateStr = record.date ? new Date(record.date).toLocaleDateString() : '';

    tr.innerHTML = `
      <td>${record.title}</td>
      <td>$${record.amount}</td>
      <td>${record.category}</td>
      <td>${record.type}</td>
      <td>${dateStr}</td>
      <td>${record.notes || ''}</td>
      <td>
        <button class="edit-btn" onclick="openEditModal('${record._id}')">✏️</button>
        <button class="delete-btn" onclick="deleteRecord('${record._id}')">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* -------------------------
   Update Summary
-------------------------- */
function updateSummary(data) {
  const totalIncome = data
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = data
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  document.getElementById('total-income').textContent = `$${totalIncome}`;
  document.getElementById('total-expenses').textContent = `$${totalExpenses}`;
  document.getElementById('net-balance').textContent = `$${(totalIncome - totalExpenses).toFixed(2)}`;
}

/* -------------------------
   Chart 1: Category Pie
-------------------------- */
function renderCategoryChart(data) {
  const ctx = document.getElementById('financeChart').getContext('2d');
  if (financeChart) financeChart.destroy();

  const categories = [...new Set(data.map((r) => r.category))];
  const categoryTotals = categories.map((cat) =>
    data.filter((r) => r.category === cat).reduce((sum, r) => sum + r.amount, 0)
  );

  financeChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [
        {
          label: 'Spending by Category',
          data: categoryTotals,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#FFA726', '#AB47BC',
            '#EC407A', '#9CCC65', '#29B6F6', '#FF7043'
          ]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: document.body.classList.contains('dark-theme') ? '#fff' : '#000'
          }
        }
      }
    }
  });
}

/* -------------------------
   Chart 2: Monthly Totals
-------------------------- */
function renderMonthlyChart(data) {
  const ctx2 = document.getElementById('financeChart2').getContext('2d');
  if (financeChart2) financeChart2.destroy();

  const monthlyMap = {};
  data.forEach((rec) => {
    if (!rec.date) return;
    const d = new Date(rec.date);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const key = `${m}/${y}`;
    if (!monthlyMap[key]) {
      monthlyMap[key] = { income: 0, expense: 0 };
    }
    if (rec.type === 'income') {
      monthlyMap[key].income += rec.amount;
    } else {
      monthlyMap[key].expense += rec.amount;
    }
  });

  const sortedKeys = Object.keys(monthlyMap).sort((a, b) => {
    const [ma, ya] = a.split('/').map(Number);
    const [mb, yb] = b.split('/').map(Number);
    return new Date(ya, ma - 1) - new Date(yb, mb - 1);
  });

  const incomes = sortedKeys.map((k) => monthlyMap[k].income);
  const expenses = sortedKeys.map((k) => monthlyMap[k].expense);

  financeChart2 = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: sortedKeys,
      datasets: [
        {
          label: 'Income',
          data: incomes,
          backgroundColor: '#4caf50'
        },
        {
          label: 'Expenses',
          data: expenses,
          backgroundColor: '#f44336'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: document.body.classList.contains('dark-theme') ? '#fff' : '#000'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: document.body.classList.contains('dark-theme') ? '#fff' : '#000' },
          grid: { display: false }
        },
        y: {
          ticks: { color: document.body.classList.contains('dark-theme') ? '#fff' : '#000' },
          grid: { color: 'rgba(0,0,0,0.1)' }
        }
      }
    }
  });
}

/* -------------------------
   ADD Record (Form Submit)
-------------------------- */
async function handleFormSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const type = document.getElementById('type').value;
  const date = document.getElementById('date').value;
  const notes = document.getElementById('notes').value;

  const body = { title, amount, category, type, notes };
  if (date) body.date = date;

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (json.success) {
      await fetchRecords();
      e.target.reset();
    } else {
      console.error(json.error);
    }
  } catch (error) {
    console.error('Error adding record:', error);
  }
}

/* -------------------------
   EDIT Record
-------------------------- */
function openEditModal(id) {
  const record = financeData.find((r) => r._id === id);
  if (!record) return;

  document.getElementById('edit-id').value = record._id;
  document.getElementById('edit-title').value = record.title;
  document.getElementById('edit-amount').value = record.amount;
  document.getElementById('edit-category').value = record.category;
  document.getElementById('edit-type').value = record.type;
  document.getElementById('edit-date').value = record.date ? record.date.split('T')[0] : '';
  document.getElementById('edit-notes').value = record.notes || '';

  document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

async function handleEditSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value;
  const amount = parseFloat(document.getElementById('edit-amount').value);
  const category = document.getElementById('edit-category').value;
  const type = document.getElementById('edit-type').value;
  const date = document.getElementById('edit-date').value;
  const notes = document.getElementById('edit-notes').value;

  const body = { title, amount, category, type, notes };
  if (date) body.date = date;

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (json.success) {
      closeEditModal();
      await fetchRecords();
    } else {
      console.error(json.error);
    }
  } catch (error) {
    console.error('Error updating record:', error);
  }
}

/* -------------------------
   DELETE Record
-------------------------- */
async function deleteRecord(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      await fetchRecords();
    } else {
      console.error(json.error);
    }
  } catch (error) {
    console.error('Error deleting record:', error);
  }
}

/* -------------------------
   IMPORT JSON
-------------------------- */
async function handleImportJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const fileData = await file.text();
    const jsonData = JSON.parse(fileData);

    const res = await fetch(`${API_BASE}/import/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData)
    });

    const result = await res.json();
    if (result.success) {
      alert('Data imported successfully!');
      await fetchRecords();
    } else {
      console.error(result);
      alert(`Import failed: ${result.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error importing JSON:', error);
    alert(`Error importing JSON: ${error.message}`);
  }
}

/* -------------------------
   FILTERING & SEARCHING
-------------------------- */
function applyFilters() {
  const typeFilter = document.getElementById('filter-type').value;
  const categoryFilter = document.getElementById('filter-category').value.toLowerCase();
  const searchInput = document.getElementById('search-input').value.toLowerCase();

  const filtered = financeData.filter((r) => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (categoryFilter && !r.category.toLowerCase().includes(categoryFilter)) return false;
    const combinedText = (r.title + ' ' + (r.notes || '')).toLowerCase();
    if (searchInput && !combinedText.includes(searchInput)) return false;
    return true;
  });

  renderTable(filtered);
  updateSummary(filtered);
  renderCategoryChart(filtered);
  renderMonthlyChart(filtered);
}

function clearFilters() {
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-category').value = '';
  document.getElementById('search-input').value = '';
  renderTable(financeData);
  updateSummary(financeData);
  renderCategoryChart(financeData);
  renderMonthlyChart(financeData);
}

/* -------------------------
   SORTING
-------------------------- */
let sortOrder = 1;
function handleSort(field) {
  sortOrder = -sortOrder;
  financeData.sort((a, b) => {
    if (field === 'date') {
      return sortOrder * (new Date(a.date) - new Date(b.date));
    } else if (field === 'amount') {
      return sortOrder * (a.amount - b.amount);
    } else {
      if (a[field] < b[field]) return -1 * sortOrder;
      if (a[field] > b[field]) return 1 * sortOrder;
      return 0;
    }
  });
  renderTable(financeData);
}

/* -------------------------
   THEME TOGGLE
-------------------------- */
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  if (document.body.classList.contains('dark-theme')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
  renderCategoryChart(financeData);
  renderMonthlyChart(financeData);
}

/* -------------------------
   ANALYTICS (Added More Calculations)
-------------------------- */
function handleAnalytics() {
  const startDate = document.getElementById('calc-start-date').value;
  const endDate = document.getElementById('calc-end-date').value;

  let filtered = [...financeData];
  if (startDate) {
    filtered = filtered.filter((r) => r.date && new Date(r.date) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter((r) => r.date && new Date(r.date) <= new Date(endDate));
  }

  if (filtered.length === 0) {
    alert('No records found for the given date range.');
    return;
  }

  const incomeRecords = filtered.filter((r) => r.type === 'income');
  const expenseRecords = filtered.filter((r) => r.type === 'expense');

  const avgIncome =
    incomeRecords.length > 0
      ? (incomeRecords.reduce((sum, r) => sum + r.amount, 0) / incomeRecords.length).toFixed(2)
      : 0;
  const avgExpense =
    expenseRecords.length > 0
      ? (expenseRecords.reduce((sum, r) => sum + r.amount, 0) / expenseRecords.length).toFixed(2)
      : 0;
  const largestIncome =
    incomeRecords.length > 0
      ? Math.max(...incomeRecords.map((r) => r.amount)).toFixed(2)
      : 0;
  const largestExpense =
    expenseRecords.length > 0
      ? Math.max(...expenseRecords.map((r) => r.amount)).toFixed(2)
      : 0;

  document.getElementById('avg-income').textContent = `$${avgIncome}`;
  document.getElementById('avg-expense').textContent = `$${avgExpense}`;
  document.getElementById('largest-income').textContent = `$${largestIncome}`;
  document.getElementById('largest-expense').textContent = `$${largestExpense}`;

  const incomesArr = incomeRecords.map((r) => r.amount);
  const expensesArr = expenseRecords.map((r) => r.amount);
  const totalIncomeRange = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenseRange = expenseRecords.reduce((sum, r) => sum + r.amount, 0);

  const medianInc = median(incomesArr);
  const medianExp = median(expensesArr);
  const expIncRatio =
    totalIncomeRange > 0 ? ((totalExpenseRange / totalIncomeRange) * 100).toFixed(2) : 0;

  document.getElementById('median-income').textContent = `$${medianInc.toFixed(2)}`;
  document.getElementById('median-expense').textContent = `$${medianExp.toFixed(2)}`;
  document.getElementById('expense-ratio').textContent = `${expIncRatio}%`;
}

function median(values) {
  if (!values || values.length === 0) return 0;
  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  if (values.length % 2 === 1) {
    return values[mid];
  }
  return (values[mid - 1] + values[mid]) / 2;
}

/* -------------------------
   CALCULATIONS
-------------------------- */

function handleCalcIRR() {
  const input = document.getElementById('irr-cashflows').value.trim();
  if (!input) {
    document.getElementById('irr-result').textContent = 'N/A';
    document.getElementById('irr-actual-result').textContent = 'N/A';
    return;
  }
  const flows = input.split(',').map((v) => parseFloat(v.trim()));
  const irrValue = computeIRR(flows);
  document.getElementById('irr-result').textContent = `${irrValue.toFixed(2)}%`;

  // Inflation adjustment: IRR - inflation
  const inflation = parseFloat(document.getElementById('irr-inflation').value) || 0;
  const actualIRR = irrValue - inflation;
  document.getElementById('irr-actual-result').textContent = `${actualIRR.toFixed(2)}%`;
}

function computeIRR(cashFlows) {
  if (!cashFlows || cashFlows.length < 2) return 0;
  let bestRate = 0;
  let minDiff = Infinity;
  for (let r = -0.9999; r < 1; r += 0.0001) {
    let npv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + r, i);
    }
    if (Math.abs(npv) < minDiff) {
      minDiff = Math.abs(npv);
      bestRate = r;
    }
  }
  return bestRate * 100;
}

function handleCalcFV() {
  const pv = parseFloat(document.getElementById('fv-present').value) || 0;
  const rate = parseFloat(document.getElementById('fv-rate').value) || 0;
  const years = parseFloat(document.getElementById('fv-years').value) || 0;
  const fv = computeFutureValue(pv, rate, years);
  document.getElementById('fv-result').textContent = `$${fv.toFixed(2)}`;

  // Inflation-based actual value
  const inflation = parseFloat(document.getElementById('fv-inflation').value) || 0;
  const realFV = fv / Math.pow(1 + inflation / 100, years);
  document.getElementById('fv-actual').textContent = `$${realFV.toFixed(2)}`;
}

function computeFutureValue(pv, annualRate, years) {
  const r = annualRate / 100;
  return pv * Math.pow(1 + r, years);
}

function handleCalcSIP() {
  const amount = parseFloat(document.getElementById('sip-amount').value) || 0;
  const rate = parseFloat(document.getElementById('sip-rate').value) || 0;
  const years = parseFloat(document.getElementById('sip-years').value) || 0;
  const fv = computeSIP(amount, rate, years);
  document.getElementById('sip-result').textContent = `$${fv.toFixed(2)}`;

  // Show total nominal amount invested
  const totalMonths = years * 12;
  const totalInvested = amount * totalMonths;
  document.getElementById('sip-total-invested').textContent = `$${totalInvested.toFixed(2)}`;

  // Inflation-based actual value
  const inflation = parseFloat(document.getElementById('sip-inflation').value) || 0;
  const realFV = fv / Math.pow(1 + inflation / 100, years);
  document.getElementById('sip-actual').textContent = `$${realFV.toFixed(2)}`;

  // (Optional) "Actual Amount Invested" if we treat inflation as eroding real cost of each payment
  // For simplicity, assume the sum of monthly payments is discounted by inflation each year
  // A rough approach:
  let actualInvested = 0;
  const monthlyRate = inflation / 100 / 12;
  for (let m = 0; m < totalMonths; m++) {
    const discountFactor = Math.pow(1 + monthlyRate, m);
    actualInvested += amount / discountFactor; // discount each month's payment
  }
  document.getElementById('sip-actual-invested').textContent = `$${actualInvested.toFixed(2)}`;
}

function computeSIP(sipAmount, annualRate, years) {
  const monthlyRate = (annualRate / 100) / 12;
  const totalMonths = years * 12;
  if (monthlyRate === 0) {
    return sipAmount * totalMonths;
  }
  return sipAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
}

function handleCalcWithdraw() {
  const principal = parseFloat(document.getElementById('withdraw-principal').value) || 0;
  const rate = parseFloat(document.getElementById('withdraw-rate').value) || 0;
  const monthly = computeMonthlyWithdrawal(principal, rate);
  document.getElementById('withdraw-result').textContent = `$${monthly.toFixed(2)}`;
}

function computeMonthlyWithdrawal(principal, annualRate) {
  const monthlyRate = (annualRate / 100) / 12;
  return principal * monthlyRate;
}

/* NEW CORPUS SUSTAINABILITY CALC */
document.getElementById('calc-sustain-btn').addEventListener('click', () => {
  const corpus = parseFloat(document.getElementById('sustain-corpus').value) || 0;
  const expense = parseFloat(document.getElementById('sustain-expense').value) || 0;
  const income = parseFloat(document.getElementById('sustain-income').value) || 0;
  const annualRate = parseFloat(document.getElementById('sustain-rate').value) || 0;
  const inflation = parseFloat(document.getElementById('sustain-inflation').value) || 0;

  const { years, realValue } = computeSustainability(corpus, expense, income, annualRate, inflation);
  document.getElementById('sustain-years').textContent = years.toFixed(1);
  document.getElementById('sustain-actual').textContent = `$${realValue.toFixed(2)}`;
});

function computeSustainability(
  initialCorpus,
  monthlyExpense,
  monthlyIncome,
  annualRate,
  annualInflation
) {
  let corpus = initialCorpus;
  let months = 0;
  const monthlyInterest = annualRate / 100 / 12;
  const monthlyInflation = annualInflation / 100 / 12;
  let currentExpense = monthlyExpense;
  let currentIncome = monthlyIncome;

  // We'll track realValue by discounting the corpus each month by inflation
  // as if each month's future corpus is worth less in today's terms.
  let realValue = initialCorpus;

  while (corpus > 0) {
    // Earn interest on the corpus
    corpus *= 1 + monthlyInterest;

    // Next, adjust expense & income for inflation each month
    currentExpense *= 1 + monthlyInflation;
    currentIncome *= 1 + monthlyInflation;

    // Subtract net outflow
    const netFlow = currentExpense - currentIncome;
    corpus -= netFlow > 0 ? netFlow : 0; // if netFlow < 0, user has leftover?

    // Discount the corpus to get "real" present value
    realValue = realValue / (1 + monthlyInflation);

    months++;
    if (months > 1200) break; // safety break ~100 years
    if (corpus <= 0) break;
  }

  const years = months / 12;
  return { years, realValue };
}


const calcToggle = document.getElementById('calc-toggle-checkbox');
  calcToggle.addEventListener('change', function () {
    const calcSection = document.getElementById('calculations-section');
    calcSection.style.display = this.checked ? 'block' : 'none';
  });

// Enhanced AI Data Analysis Feature with Refined Typewriter and Dynamic Chart Reveal
document.getElementById('ai-calc-btn').addEventListener('click', runAIAnalysis);

function runAIAnalysis() {
  const typewriterElem = document.getElementById('ai-typewriter');
  // Clear previous typewriter content and show the processing area
  typewriterElem.innerHTML = "";
  document.querySelector('.ai-processing').style.display = "block";

  // Advanced AI/tech style messages (one-at-a-time)
  const messages = [
    "Initializing quantum financial analytics module...",
    "Decrypting secured data streams...",
    "Modern Portfolio Theory (MPT) algorithm engaged...",
    "Loading advanced machine learning models...",
    "Deploying blockchain-backed statistical algorithms...",
    "The model is experiencing high demand (location: NYSE), prorating your request...",
    "Calibrating high-frequency fiscal optimization routines..."
  ];

  // Typewriter effect: clear the element before typing each message,
  // then wait, then clear again before the next message appears.
  function typeWriter(text, element, delay, callback) {
    element.innerHTML = ""; // clear previous text
    let i = 0;
    function writer() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(writer, delay);
      } else {
        // Wait, then clear for the next message
        setTimeout(function() {
          element.innerHTML = "";
          if (callback) callback();
        }, 1000);
      }
    }
    writer();
  }
  
  // Display messages sequentially
  function displayMessages(index) {
    if (index < messages.length) {
      typeWriter(messages[index], typewriterElem, 40, function() {
        setTimeout(function() {
          displayMessages(index + 1);
        }, 500);
      });
    } else {
      // After all messages, hide the processing area and show the chart section
      document.querySelector('.ai-processing').style.display = "none";
      document.querySelector('.ai-chart-section').style.display = "block";
      setTimeout(computeAIAnalysis, 500);
    }
  }
  
  displayMessages(0);
}

function computeAIAnalysis() {
  // Retrieve records from the existing financeData array
  const incomeRecords = financeData.filter(r => r.type === 'income');
  const expenseRecords = financeData.filter(r => r.type === 'expense');
  
  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = expenseRecords.reduce((sum, r) => sum + r.amount, 0);
  const savings = totalIncome - totalExpense;
  
  const incomeArr = incomeRecords.map(r => r.amount);
  const expenseArr = expenseRecords.map(r => r.amount);
  const medianIncome = median(incomeArr);
  const medianExpense = median(expenseArr);
  
  // Categorize expenses into essential vs. non-essential
  const essentialKeywords = ["health", "groceries", "education", "rent", "utilities", "transportation"];
  let essentialExpense = 0, nonEssentialExpense = 0;
  let nonEssentialCategoriesSet = new Set();
  expenseRecords.forEach(record => {
    const category = record.category.toLowerCase();
    const isEssential = essentialKeywords.some(keyword => category.includes(keyword));
    if (isEssential) {
      essentialExpense += record.amount;
    } else {
      nonEssentialExpense += record.amount;
      nonEssentialCategoriesSet.add(record.category);
    }
  });
  
  // Compute ratios and key metrics
  const expensePercent = totalIncome > 0 ? (totalExpense / totalIncome * 100) : 0;
  const netSavingsRatio = totalIncome > 0 ? (savings / totalIncome * 100) : 0;
  const essentialRatio = totalExpense > 0 ? (essentialExpense / totalExpense * 100) : 0;
  const nonEssentialRatio = totalExpense > 0 ? (nonEssentialExpense / totalExpense * 100) : 0;
  const financialHealthScore = netSavingsRatio * (1 - (nonEssentialRatio / 100));
  
  // Generate recommendation message based on the Financial Health Score
  let healthMessage = "";
  if (financialHealthScore > 20) {
    healthMessage = "Excellent financial health.";
  } else if (financialHealthScore > 10) {
    healthMessage = "Good health, but improvements are possible.";
  } else {
    healthMessage = "Financial health is suboptimal—consider reducing non-essential spending.";
  }
  
  // Update summary cards with computed values
  document.getElementById('ai-total-income').innerText = `$${totalIncome.toFixed(2)}`;
  document.getElementById('ai-total-expenses').innerText = `$${totalExpense.toFixed(2)}`;
  document.getElementById('ai-savings').innerText = `$${savings.toFixed(2)}`;
  document.getElementById('ai-median-income').innerText = `$${medianIncome.toFixed(2)}`;
  document.getElementById('ai-median-expense').innerText = `$${medianExpense.toFixed(2)}`;
  document.getElementById('ai-recommendation-message').innerHTML = healthMessage;
  
  // Build a radar chart for key financial metrics using Chart.js
  const radarCtx = document.getElementById('ai-radar-chart').getContext('2d');
  if(window.aiRadarChartInstance) {
    window.aiRadarChartInstance.destroy();
  }
  window.aiRadarChartInstance = new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels: ['Net Savings %', 'Expense %', 'Essential %', 'Non-essential %', 'FHS'],
      datasets: [{
        label: 'Financial Metrics',
        data: [
          parseFloat(netSavingsRatio.toFixed(2)), 
          parseFloat(expensePercent.toFixed(2)), 
          parseFloat(essentialRatio.toFixed(2)), 
          parseFloat(nonEssentialRatio.toFixed(2)), 
          parseFloat(financialHealthScore.toFixed(2))
        ],
        backgroundColor: 'rgba(103, 58, 183, 0.2)',
        borderColor: 'rgba(103, 58, 183, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(103, 58, 183, 1)'
      }]
    },
    options: {
      scales: {
        r: {
          angleLines: { display: true },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { backdropColor: 'transparent' }
        }
      },
      plugins: {
        legend: {
          labels: { color: document.body.classList.contains('dark-theme') ? '#fff' : '#000' }
        }
      }
    }
  });
}

// Utility: Calculate median
function median(values) {
  if (!values || values.length === 0) return 0;
  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  return (values.length % 2 !== 0) ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}
