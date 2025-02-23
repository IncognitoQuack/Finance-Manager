// Base URL for your API
const API_BASE = '/api/finance';

// Global data array (all records)
let financeData = [];

// Chart references
let financeChart;
let financeChart2;

// On DOM load
document.addEventListener('DOMContentLoaded', async () => {
  // Fetch initial records
  await fetchRecords();

  // Form submission (Add)
  const financeForm = document.getElementById('finance-form');
  financeForm.addEventListener('submit', handleFormSubmit);

  // Export JSON
  document.getElementById('export-json-btn').addEventListener('click', () => {
    window.location.href = `${API_BASE}/export/json`;
  });

  // Import JSON
  const importBtn = document.getElementById('import-json-btn');
  const importFile = document.getElementById('import-json-file');
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', handleImportJSON);

  // Generate PDF
  document.getElementById('pdf-report-btn').addEventListener('click', () => {
    window.location.href = `${API_BASE}/report/pdf`;
  });

  // Filtering & Searching
  document.getElementById('apply-filters-btn').addEventListener('click', applyFilters);
  document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);

  // Sorting
  document.querySelectorAll('#finance-table thead th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => handleSort(th.getAttribute('data-sort')));
  });

  // Edit Modal
  const closeModalBtn = document.querySelector('.close-modal');
  closeModalBtn.addEventListener('click', closeEditModal);
  document.getElementById('edit-form').addEventListener('submit', handleEditSubmit);

  // Theme Toggle
  const themeSwitch = document.getElementById('theme-switch');
  themeSwitch.addEventListener('change', toggleTheme);

  // Load saved theme preference from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeSwitch.checked = true;
  }

  // Analytics
  document.getElementById('calc-btn').addEventListener('click', handleAnalytics);
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
        <button onclick="openEditModal('${record._id}')">Edit</button>
        <button onclick="deleteRecord('${record._id}')">Delete</button>
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
          labels: { color: document.body.classList.contains('dark-theme') ? '#fff' : '#000' }
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

  // Group by Month-Year
  const monthlyMap = {};
  data.forEach((rec) => {
    if (!rec.date) return;
    const d = new Date(rec.date);
    const m = d.getMonth() + 1; // 1-12
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

  // Sort by date
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
      // Refresh data
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
  // Find record
  const record = financeData.find((r) => r._id === id);
  if (!record) return;

  // Populate modal fields
  document.getElementById('edit-id').value = record._id;
  document.getElementById('edit-title').value = record.title;
  document.getElementById('edit-amount').value = record.amount;
  document.getElementById('edit-category').value = record.category;
  document.getElementById('edit-type').value = record.type;
  document.getElementById('edit-date').value = record.date ? record.date.split('T')[0] : '';
  document.getElementById('edit-notes').value = record.notes || '';

  // Show modal
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
    }
  } catch (error) {
    console.error('Error importing JSON:', error);
  }
}

/* -------------------------
   FILTERING & SEARCHING
-------------------------- */
function applyFilters() {
  const typeFilter = document.getElementById('filter-type').value; // income/expense
  const categoryFilter = document.getElementById('filter-category').value.toLowerCase();
  const searchInput = document.getElementById('search-input').value.toLowerCase();

  const filtered = financeData.filter((r) => {
    // Filter by type
    if (typeFilter && r.type !== typeFilter) return false;
    // Filter by category substring
    if (categoryFilter && !r.category.toLowerCase().includes(categoryFilter)) return false;
    // Search in title or notes
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
  // Re-render with full data
  renderTable(financeData);
  updateSummary(financeData);
  renderCategoryChart(financeData);
  renderMonthlyChart(financeData);
}

/* -------------------------
   SORTING
-------------------------- */
let sortOrder = 1; // 1 for ascending, -1 for descending
function handleSort(field) {
  sortOrder = -sortOrder; // toggle

  financeData.sort((a, b) => {
    if (field === 'date') {
      // Compare dates
      return sortOrder * (new Date(a.date) - new Date(b.date));
    } else if (field === 'amount') {
      return sortOrder * (a.amount - b.amount);
    } else {
      // String fields (title, category, type)
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

  // Save user preference
  if (document.body.classList.contains('dark-theme')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }

  // Re-render charts to update label colors
  renderCategoryChart(financeData);
  renderMonthlyChart(financeData);
}

/* -------------------------
   ANALYTICS
-------------------------- */
function handleAnalytics() {
  const startDate = document.getElementById('calc-start-date').value;
  const endDate = document.getElementById('calc-end-date').value;

  // Filter data by date range if provided
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

  // Calculate average income, average expense, largest income, largest expense
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
}
