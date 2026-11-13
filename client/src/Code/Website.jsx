
import React, { useState } from "react";
import "./Website.css";

const initialTransactions = [
  { id: 1, title: "Monthly Salary", category: "Income", date: "Nov 12, 2026", amount: 1850, type: "income", icon: "💼" },
  { id: 2, title: "Apartment Rent", category: "Housing", date: "Nov 10, 2026", amount: 650, type: "expense", icon: "🏠" },
  { id: 3, title: "Grocery Shopping", category: "Food", date: "Nov 09, 2026", amount: 78.5, type: "expense", icon: "🛒" },
  { id: 4, title: "Deutschlandticket", category: "Transport", date: "Nov 08, 2026", amount: 58, type: "expense", icon: "🚆" },
  { id: 5, title: "Netflix Subscription", category: "Entertainment", date: "Nov 06, 2026", amount: 13.99, type: "expense", icon: "🎬" },
  { id: 6, title: "Freelance Payment", category: "Income", date: "Nov 04, 2026", amount: 320, type: "income", icon: "💻" },
];

const initialBudgets = [
  { name: "Housing", spent: 650, limit: 750, color: "#5688E8", icon: "🏠" },
  { name: "Food & Groceries", spent: 245, limit: 350, color: "#F2A84B", icon: "🛒" },
  { name: "Transport", spent: 58, limit: 100, color: "#9A78D8", icon: "🚆" },
  { name: "Entertainment", spent: 85, limit: 120, color: "#E47D94", icon: "🎮" },
];

const chartData = [
  { month: "Jun", income: 1800, expenses: 1250 },
  { month: "Jul", income: 1950, expenses: 1400 },
  { month: "Aug", income: 1850, expenses: 1150 },
  { month: "Sep", income: 2100, expenses: 1550 },
  { month: "Oct", income: 1850, expenses: 1320 },
  { month: "Nov", income: 2170, expenses: 1120 },
];

const money = (amount) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);

function Website() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({
    title: "",
    category: "Food",
    amount: "",
    type: "expense",
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Income" && t.type === "income") ||
      (filter === "Expenses" && t.type === "expense");

    return matchesSearch && matchesFilter;
  });

  function addTransaction(e) {
    e.preventDefault();

    if (!form.title.trim() || Number(form.amount) <= 0) return;

    const newTransaction = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      amount: Number(form.amount),
      type: form.type,
      icon: form.type === "income" ? "💰" : "💳",
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    setTransactions((previous) => [newTransaction, ...previous]);
    setForm({
      title: "",
      category: "Food",
      amount: "",
      type: "expense",
    });
    setShowModal(false);
  }

  function deleteTransaction(id) {
    setTransactions((previous) => previous.filter((t) => t.id !== id));
  }

  const navItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Transactions", icon: "↕" },
    { name: "Budgets", icon: "◷" },
    { name: "Savings Goals", icon: "◎" },
    { name: "Reports", icon: "▤" },
  ];

  return (
    <div className="lb-app">
      <aside className="lb-sidebar">
        <div className="lb-brand">
          <div className="lb-brand-icon">L</div>
          <span>Life<span>Budget</span></span>
        </div>

        <div className="lb-nav-label">MENU</div>

        <nav className="lb-navigation">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`lb-nav-item ${activePage === item.name ? "active" : ""}`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="lb-nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="lb-sidebar-bottom">
          <div className="lb-help-card">
            <div className="lb-help-icon">✦</div>
            <strong>Need help?</strong>
            <p>Manage your money smarter with LifeBudget.</p>
            <button onClick={() => alert("Help centre coming soon!")}>
              Get support →
            </button>
          </div>

          <div className="lb-profile">
            <div className="lb-avatar">JD</div>
            <div className="lb-profile-info">
              <strong>John Doe</strong>
              <span>Personal Account</span>
            </div>
            <span className="lb-dots">•••</span>
          </div>
        </div>
      </aside>

      <main className="lb-main">
        <header className="lb-header">
          <div>
            <div className="lb-breadcrumb">Pages / {activePage}</div>
            <h1>{activePage}</h1>
          </div>

          <div className="lb-header-actions">
            <div className="lb-month-select">📅 November 2026⌄</div>
            <button className="lb-notification" aria-label="Notifications">♧</button>
            <div className="lb-header-avatar">JD</div>
          </div>
        </header>

        {activePage === "Dashboard" && (
          <>
            <section className="lb-welcome">
              <div>
                <h2>Good morning, John! 👋</h2>
                <p>Here's what's happening with your money today.</p>
              </div>
              <button className="lb-primary-button" onClick={() => setShowModal(true)}>
                <span>＋</span> Add transaction
              </button>
            </section>

            <section className="lb-stats-grid">
              <div className="lb-stat-card">
                <div className="lb-stat-top">
                  <span>Total Balance</span>
                  <span className="lb-stat-icon green">€</span>
                </div>
                <h2>{money(balance)}</h2>
                <div className="lb-stat-footer positive">↑ Your available balance</div>
              </div>

              <div className="lb-stat-card">
                <div className="lb-stat-top">
                  <span>Total Income</span>
                  <span className="lb-stat-icon blue">↙</span>
                </div>
                <h2>{money(totalIncome)}</h2>
                <div className="lb-stat-footer positive">↑ Money received</div>
              </div>

              <div className="lb-stat-card">
                <div className="lb-stat-top">
                  <span>Total Expenses</span>
                  <span className="lb-stat-icon orange">↗</span>
                </div>
                <h2>{money(totalExpenses)}</h2>
                <div className="lb-stat-footer negative">↓ Money spent</div>
              </div>

              <div className="lb-stat-card">
                <div className="lb-stat-top">
                  <span>Savings Rate</span>
                  <span className="lb-stat-icon purple">%</span>
                </div>
                <h2>{totalIncome ? Math.round((balance / totalIncome) * 100) : 0}%</h2>
                <div className="lb-stat-footer positive">Of your total income</div>
              </div>
            </section>

            <section className="lb-content-grid">
              <div className="lb-panel lb-chart-panel">
                <div className="lb-panel-header">
                  <div>
                    <h3>Financial Overview</h3>
                    <p>Income vs expenses over time</p>
                  </div>
                  <span className="lb-chart-period">Last 6 months⌄</span>
                </div>

                <div className="lb-chart-legend">
                  <span><i className="legend-income"></i> Income</span>
                  <span><i className="legend-expense"></i> Expenses</span>
                </div>

                <div className="lb-chart">
                  <div className="lb-y-axis">
                    <span>€2,500</span>
                    <span>€2,000</span>
                    <span>€1,500</span>
                    <span>€1,000</span>
                    <span>€500</span>
                    <span>€0</span>
                  </div>

                  <div className="lb-chart-bars">
                    {chartData.map((item) => (
                      <div className="lb-chart-column" key={item.month}>
                        <div className="lb-bars">
                          <div
                            className="lb-bar income-bar"
                            style={{ height: `${(item.income / 2500) * 100}%` }}
                            title={`Income: ${money(item.income)}`}
                          ></div>
                          <div
                            className="lb-bar expense-bar"
                            style={{ height: `${(item.expenses / 2500) * 100}%` }}
                            title={`Expenses: ${money(item.expenses)}`}
                          ></div>
                        </div>
                        <span>{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lb-panel lb-budget-panel">
                <div className="lb-panel-header">
                  <div>
                    <h3>Budget Overview</h3>
                    <p>Your monthly spending limits</p>
                  </div>
                  <button className="lb-text-button" onClick={() => setActivePage("Budgets")}>View all →</button>
                </div>

                {initialBudgets.map((budget) => (
                  <div className="lb-budget-item" key={budget.name}>
                    <div className="lb-budget-info">
                      <span>{budget.icon} {budget.name}</span>
                      <strong>{money(budget.spent)} <small>/ {money(budget.limit)}</small></strong>
                    </div>
                    <div className="lb-progress-track">
                      <div
                        className="lb-progress-fill"
                        style={{
                          width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%`,
                          background: budget.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="lb-panel lb-transactions-panel">
              <div className="lb-panel-header">
                <div>
                  <h3>Recent Transactions</h3>
                  <p>Keep track of your latest activity</p>
                </div>
                <button className="lb-text-button" onClick={() => setActivePage("Transactions")}>View all →</button>
              </div>

              <TransactionTable
                transactions={transactions.slice(0, 5)}
                onDelete={deleteTransaction}
              />
            </section>
          </>
        )}

        {activePage === "Transactions" && (
          <section className="lb-panel lb-transactions-panel">
            <div className="lb-panel-header">
              <div>
                <h3>All Transactions</h3>
                <p>Manage your income and expenses.</p>
              </div>
              <button className="lb-primary-button" onClick={() => setShowModal(true)}>
                ＋ Add transaction
              </button>
            </div>

            <div className="lb-filters">
              <input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option>All</option>
                <option>Income</option>
                <option>Expenses</option>
              </select>
            </div>

            <TransactionTable
              transactions={filteredTransactions}
              onDelete={deleteTransaction}
            />
          </section>
        )}

        {activePage === "Budgets" && (
          <section className="lb-panel lb-transactions-panel">
            <div className="lb-panel-header">
              <div>
                <h3>Monthly Budgets</h3>
                <p>Keep your spending under control.</p>
              </div>
            </div>
            <div className="lb-budget-page">
              {initialBudgets.map((budget) => (
                <div className="lb-budget-large" key={budget.name}>
                  <div className="lb-budget-info">
                    <span>{budget.icon} {budget.name}</span>
                    <strong>{money(budget.spent)} / {money(budget.limit)}</strong>
                  </div>
                  <div className="lb-progress-track">
                    <div className="lb-progress-fill" style={{
                      width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%`,
                      background: budget.color
                    }}></div>
                  </div>
                  <p>{Math.round((budget.spent / budget.limit) * 100)}% of budget used</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activePage === "Savings Goals" && (
          <section className="lb-panel lb-transactions-panel">
            <div className="lb-panel-header">
              <div>
                <h3>Your Savings Goals</h3>
                <p>Small savings, bigger achievements.</p>
              </div>
            </div>
            <div className="lb-goals-grid">
              <div className="lb-goal-card">
                <span>✈️</span><h3>Travel Fund</h3>
                <strong>€650 / €1,500</strong>
                <div className="lb-progress-track"><div className="lb-progress-fill" style={{width:"43%",background:"#5688E8"}}></div></div>
              </div>
              <div className="lb-goal-card">
                <span>💻</span><h3>New Laptop</h3>
                <strong>€900 / €1,800</strong>
                <div className="lb-progress-track"><div className="lb-progress-fill" style={{width:"50%",background:"#159B72"}}></div></div>
              </div>
              <div className="lb-goal-card">
                <span>🛟</span><h3>Emergency Fund</h3>
                <strong>€400 / €2,000</strong>
                <div className="lb-progress-track"><div className="lb-progress-fill" style={{width:"20%",background:"#E4A04A"}}></div></div>
              </div>
            </div>
          </section>
        )}

        {activePage === "Reports" && (
          <section className="lb-panel lb-transactions-panel">
            <div className="lb-panel-header">
              <div>
                <h3>Financial Reports</h3>
                <p>Your current financial summary.</p>
              </div>
            </div>
            <div className="lb-report-grid">
              <div><span>Total Income</span><strong>{money(totalIncome)}</strong></div>
              <div><span>Total Expenses</span><strong>{money(totalExpenses)}</strong></div>
              <div><span>Net Balance</span><strong>{money(balance)}</strong></div>
              <div><span>Transactions</span><strong>{transactions.length}</strong></div>
            </div>
          </section>
        )}

        <footer className="lb-footer">
          © 2026 LifeBudget. Take control of your money.
          <span>Made with care 💚</span>
        </footer>
      </main>

      {showModal && (
        <div className="lb-modal-overlay" onClick={() => setShowModal(false)}>
          <form className="lb-modal" onSubmit={addTransaction} onClick={(e) => e.stopPropagation()}>
            <div className="lb-modal-header">
              <div><h2>Add Transaction</h2><p>Record your financial activity.</p></div>
              <button type="button" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <label>Transaction name</label>
            <input
              required
              placeholder="e.g. Grocery shopping"
              value={form.title}
              onChange={(e) => setForm({...form, title:e.target.value})}
            />

            <label>Amount (€)</label>
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({...form, amount:e.target.value})}
            />

            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({...form, type:e.target.value})}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({...form, category:e.target.value})}>
              <option>Food</option>
              <option>Housing</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Shopping</option>
              <option>Health</option>
              <option>Salary</option>
              <option>Other</option>
            </select>

            <button className="lb-primary-button lb-submit-button" type="submit">
              Save transaction
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function TransactionTable({ transactions, onDelete }) {
  if (!transactions.length) {
    return <div className="lb-empty">No transactions found.</div>;
  }

  return (
    <div className="lb-table-wrapper">
      <table className="lb-table">
        <thead>
          <tr>
            <th>TRANSACTION</th>
            <th>CATEGORY</th>
            <th>DATE</th>
            <th>AMOUNT</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>
                <div className="lb-transaction-name">
                  <span className="lb-transaction-icon">{transaction.icon}</span>
                  <strong>{transaction.title}</strong>
                </div>
              </td>
              <td><span className="lb-category">{transaction.category}</span></td>
              <td>{transaction.date}</td>
              <td className={transaction.type === "income" ? "lb-income-text" : "lb-expense-text"}>
                {transaction.type === "income" ? "+" : "-"}{money(transaction.amount)}
              </td>
              <td>
                <button className="lb-delete" onClick={() => onDelete(transaction.id)} title="Delete transaction">×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Website;
