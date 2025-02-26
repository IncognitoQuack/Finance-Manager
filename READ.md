# FinancePro – Personal Finance Manager

FinancePro is a comprehensive, easy-to-use personal finance management web application. Track expenses, incomes, budgets, and generate professional PDF reports. FinancePro also provides advanced analytics and expert financial calculators (IRR, SIP, Future Value, Corpus Sustainability, etc.) for deeper insights into your finances.

<img src="https://cdn-icons-png.flaticon.com/512/11782/11782361.png" alt="FinancePro Banner" width="300" height="300">

---

## 🚀 Features

- **Add/Edit/Delete Finance Records**  
  Manage all your transactions (income or expense) in one place.
- **Categorized Overview**  
  Categorize records to see monthly totals and category-wise spending.
- **Dynamic Charts**  
  Visualize your finances with Chart.js (spending breakdown, monthly trends).
- **Filtering & Sorting**  
  Filter by type (income/expense) or category substring, and sort by column.
- **Export/Import JSON**  
  Easily back up or load data with JSON export and import.
- **Professional PDF Reports**  
  Generate PDF summaries complete with charts and tabular data.
- **Advanced Analytics**  
  See largest expenses, medians, ratios, and more for a given date range.
- **Expert Calculations**  
  - **IRR Calculator**  
  - **Future Value** (Lump Sum & SIP)  
  - **Monthly Withdrawal** without depleting principal  
  - **Corpus Sustainability** (estimate how long funds last)

---


## 🔧 Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Chart.js for charts)
- **Backend**: Node.js, Express
- **Database**: MongoDB (via Mongoose)
- **PDF Generation**: PDFKit
- **Additional Services**: AI Categorization, CSV Import, Notification (nodemailer) – optional

---

## 📥 Installation

1. **Clone or Download** this repository:
   ```bash
   git clone https://github.com/your-username/FinancePro.git
   cd FinancePro
   ```

2. **Install Dependencies:**
    ```bash
    npm install
    ```

3. **Run the Application**:
    ```bash
    npm start
    ```

    **Note: Windows users can also run the script named**: ***Server Launcher.bat***

## 📌 Usage

1. **Add Records**:
* Fill out the “Add Finance Record” form with Title, Amount, Category, etc.
* Click Add Record to save.

2. **View & Edit**: 
* The main table lists all records. Click Edit to update a record, or Delete to remove it.

3. **Filter & Sort**:
* Filter by type (income/expense), category, or search text.
* Sort columns by clicking their headers.

4. **Analytics**:
* Specify a date range and click Calculate to see average income, expense, largest transactions, median values, and more.

5. **Expert Calculations**:
* IRR (long-term plan).
* Future Value (lump sum or SIP).
* Monthly Withdrawal (no principal depletion).
* Corpus Sustainability (estimate how long funds last with given income, expense, interest, and inflation),

6. **Generate PDF**:
* Click Generate PDF Report for a professional PDF summarizing your data with charts.

7. **Export/Import**:
* Export JSON to save all records to a .json file.
* Import JSON to bulk load records from a file.


## 🤝 Contributing

For those with the skills to enhance SecureChat, contributions are welcome:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/some-new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/some-new-feature`)
5. Open a Pull Request on the main repo with a description of your changes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

---

Crafted by [IncognitoQuack].   
