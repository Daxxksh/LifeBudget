
import { useEffect, useState } from "react";
import "./Website.css";

const API_URL = "http://localhost:5000/api";

// Monthly spending limits. The "spent" amount is calculated from real transactions below.
const budgetSettings = [
  { name: "Housing", category: "Housing", limit: 750, color: "#5688E8", icon: "🏠" },
  { name: "Food & Groceries", category: "Food", limit: 350, color: "#F2A84B", icon: "🛒" },
  { name: "Transport", category: "Transport", limit: 100, color: "#9A78D8", icon: "🚆" },
  { name: "Entertainment", category: "Entertainment", limit: 120, color: "#E47D94", icon: "🎮" },
];

const chartData = [
  { month: "Jun", income: 1800, expenses: 1250 },
  { month: "Jul", income: 1950, expenses: 1400 },
  { month: "Aug", income: 1850, expenses: 1150 },
  { month: "Sep", income: 2100, expenses: 1550 },
  { month: "Oct", income: 1850, expenses: 1320 },
  { month: "Nov", income: 2170, expenses: 1120 },
];

const emptyForm = {
  title: "",
  category: "Food",
  amount: "",
  type: "expense",
  description: "",
  transaction_date: new Date().toISOString().slice(0, 10),
};

const money = (amount) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const datePart = String(dateValue).slice(0, 10);
  const date = new Date(`${datePart}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTransactionIcon(category, type) {
  if (type === "income") return "💰";

  const icons = {
    Food: "🛒",
    Housing: "🏠",
    Transport: "🚆",
    Entertainment: "🎬",
    Shopping: "🛍️",
    Health: "💊",
    Salary: "💼",
    Other: "💳",
  };

  return icons[category] || "💳";
}

function mapTransaction(transaction) {
  return {
    ...transaction,
    amount: Number(transaction.amount),
    date: formatDate(transaction.transaction_date),
    icon: getTransactionIcon(transaction.category, transaction.type),
  };
}

export default function Website({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [transactions, setTransactions] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(emptyForm);

  // Fetch transactions from PostgreSQL
  async function fetchTransactions() {
    try {
      setError("");

      const response = await fetch(`${API_URL}/transactions`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load transactions.");
      }

      setTransactions((data.transactions || []).map(mapTransaction));
    } catch (error) {
      console.error("Fetch transactions error:", error);
      setError(error.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // Load transactions when dashboard opens
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Calculate dashboard totals
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpenses;

  const savingsRate = totalIncome
    ? Math.round((balance / totalIncome) * 100)
    : 0;

  // Calculate this month's spending for each budget category.
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const budgets = budgetSettings.map((budget) => {
    const spent = transactions
      .filter((transaction) => {
        if (transaction.type !== "expense" || transaction.category !== budget.category) {
          return false;
        }

        const transactionDate = new Date(
          `${String(transaction.transaction_date).slice(0, 10)}T00:00:00`
        );

        return (
          !Number.isNaN(transactionDate.getTime()) &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return { ...budget, spent };
  });

  // Search and filter
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.title.toLowerCase().includes(search.toLowerCase()) ||
      transaction.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Income" && transaction.type === "income") ||
      (filter === "Expenses" && transaction.type === "expense");

    return matchesSearch && matchesFilter;
  });

  // Open Add Transaction modal
  function openAddModal() {
    setEditingTransaction(null);
    setForm({
      ...emptyForm,
      transaction_date: new Date().toISOString().slice(0, 10),
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  // Open Edit Transaction modal
  function openEditModal(transaction) {
    setEditingTransaction(transaction);

    setForm({
      title: transaction.title,
      category: transaction.category,
      amount: String(transaction.amount),
      type: transaction.type,
      description: transaction.description || "",
      transaction_date: transaction.transaction_date
        ? String(transaction.transaction_date).slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  // Close modal
  function closeModal() {
    if (submitting) return;

    setShowModal(false);
    setEditingTransaction(null);
    setForm(emptyForm);
  }

  // Add or update transaction
  async function saveTransaction(e) {
    e.preventDefault();

    const amount = Number(form.amount);

    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid title and amount.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const isEditing = Boolean(editingTransaction);

      const url = isEditing
        ? `${API_URL}/transactions/${editingTransaction.id}`
        : `${API_URL}/transactions`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          amount,
          type: form.type,
          category: form.category,
          description: form.description.trim() || null,
          transaction_date: form.transaction_date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Could not update transaction."
              : "Could not create transaction.")
        );
      }

      if (isEditing) {
        setTransactions((previous) =>
          previous.map((transaction) =>
            transaction.id === editingTransaction.id
              ? mapTransaction(data.transaction)
              : transaction
          )
        );

        setSuccess("Transaction updated successfully!");
      } else {
        setTransactions((previous) => [
          mapTransaction(data.transaction),
          ...previous,
        ]);

        setSuccess("Transaction added successfully!");
      }

      setShowModal(false);
      setEditingTransaction(null);
      setForm(emptyForm);
    } catch (error) {
      console.error("Save transaction error:", error);
      setError(error.message || "Could not save transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete transaction
  async function deleteTransaction(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete transaction.");
      }

      setTransactions((previous) =>
        previous.filter((transaction) => transaction.id !== id)
      );

      setSuccess("Transaction deleted successfully!");
    } catch (error) {
      console.error("Delete transaction error:", error);
      setError(error.message || "Could not delete transaction.");
    } finally {
      setDeletingId(null);
    }
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
          <span>
            Life<span>Budget</span>
          </span>
        </div>

        <div className="lb-nav-label">MENU</div>

        <nav className="lb-navigation">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`lb-nav-item ${
                activePage === item.name ? "active" : ""
              }`}
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
            <div className="lb-avatar">
              {(user?.name || "User").slice(0, 2).toUpperCase()}
            </div>

            <div className="lb-profile-info">
              <strong>{user?.name || "User"}</strong>
              <span>Personal Account</span>
            </div>

            <button
              className="lb-logout"
              onClick={onLogout}
              title="Logout"
            >
              Logout
            </button>
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
            <div className="lb-month-select">
              📅 {new Date().toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </div>

            <div className="lb-header-avatar">
              {(user?.name || "User").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {error && (
          <div className="auth-error" role="alert">
            ⚠ {error}
          </div>
        )}

        {success && (
          <div className="auth-success" role="status">
            {success}
          </div>
        )}

        {activePage === "Dashboard" && (
          <>
            <section className="lb-welcome">
              <div>
                <h2>Welcome, {user?.name || "User"}! 👋</h2>
                <p>Here's what's happening with your money today.</p>
              </div>

              <button className="lb-primary-button" onClick={openAddModal}>
                ＋ Add transaction
              </button>
            </section>

            <section className="lb-stats-grid">
              <StatCard
                title="Total Balance"
                amount={money(balance)}
                icon="€"
                color="green"
                footer="Available balance"
              />

              <StatCard
                title="Total Income"
                amount={money(totalIncome)}
                icon="↙"
                color="blue"
                footer="Money received"
              />

              <StatCard
                title="Total Expenses"
                amount={money(totalExpenses)}
                icon="↗"
                color="orange"
                footer="Money spent"
              />

              <StatCard
                title="Savings Rate"
                amount={`${savingsRate}%`}
                icon="%"
                color="purple"
                footer="Of your total income"
              />
            </section>

            <section className="lb-content-grid">
              <div className="lb-panel">
                <div className="lb-panel-header">
                  <div>
                    <h3>Financial Overview</h3>
                    <p>Income vs expenses over time</p>
                  </div>
                  <span className="lb-chart-period">Last 6 months</span>
                </div>

                <div className="lb-chart-legend">
                  <span><i className="legend-income" /> Income</span>
                  <span><i className="legend-expense" /> Expenses</span>
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
                            style={{
                              height: `${(item.income / 2500) * 100}%`,
                            }}
                            title={`Income: ${money(item.income)}`}
                          />

                          <div
                            className="lb-bar expense-bar"
                            style={{
                              height: `${(item.expenses / 2500) * 100}%`,
                            }}
                            title={`Expenses: ${money(item.expenses)}`}
                          />
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

                  <button
                    className="lb-text-button"
                    onClick={() => setActivePage("Budgets")}
                  >
                    View all →
                  </button>
                </div>

                {budgets.map((budget) => (
                  <BudgetItem budget={budget} key={budget.name} />
                ))}
              </div>
            </section>

            <section className="lb-panel lb-transactions-panel">
              <div className="lb-panel-header">
                <div>
                  <h3>Recent Transactions</h3>
                  <p>Keep track of your latest activity</p>
                </div>

                <button
                  className="lb-text-button"
                  onClick={() => setActivePage("Transactions")}
                >
                  View all →
                </button>
              </div>

              {loading ? (
                <div className="lb-empty">Loading transactions...</div>
              ) : (
                <TransactionTable
                  transactions={transactions.slice(0, 5)}
                  onEdit={openEditModal}
                  onDelete={deleteTransaction}
                  deletingId={deletingId}
                />
              )}
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

              <button className="lb-primary-button" onClick={openAddModal}>
                ＋ Add transaction
              </button>
            </div>

            <div className="lb-filters">
              <input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All</option>
                <option>Income</option>
                <option>Expenses</option>
              </select>
            </div>

            {loading ? (
              <div className="lb-empty">Loading transactions...</div>
            ) : (
              <TransactionTable
                transactions={filteredTransactions}
                onEdit={openEditModal}
                onDelete={deleteTransaction}
                deletingId={deletingId}
              />
            )}
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
              {budgets.map((budget) => (
                <BudgetItem budget={budget} key={budget.name} large />
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
              <GoalCard icon="✈️" title="Travel Fund" saved={650} target={1500} />
              <GoalCard icon="💻" title="New Laptop" saved={900} target={1800} />
              <GoalCard icon="🛟" title="Emergency Fund" saved={400} target={2000} />
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
              <ReportCard title="Total Income" value={money(totalIncome)} />
              <ReportCard title="Total Expenses" value={money(totalExpenses)} />
              <ReportCard title="Net Balance" value={money(balance)} />
              <ReportCard title="Transactions" value={transactions.length} />
            </div>
          </section>
        )}

        <footer className="lb-footer">
          © 2026 LifeBudget. Take control of your money.
          <span>Made with care 💚</span>
        </footer>
      </main>

      {showModal && (
        <div className="lb-modal-overlay" onClick={closeModal}>
          <form
            className="lb-modal"
            onSubmit={saveTransaction}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lb-modal-header">
              <div>
                <h2>
                  {editingTransaction ? "Edit Transaction" : "Add Transaction"}
                </h2>
                <p>
                  {editingTransaction
                    ? "Update your financial activity."
                    : "Record your financial activity."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                ⚠ {error}
              </div>
            )}

            <label>Transaction name</label>
            <input
              required
              maxLength={100}
              placeholder="e.g. Grocery shopping"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <label>Amount (€)</label>
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
            />

            <label>Type</label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option>Food</option>
              <option>Housing</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Shopping</option>
              <option>Health</option>
              <option>Salary</option>
              <option>Other</option>
            </select>

            <label>Description (optional)</label>
            <textarea
              rows="3"
              maxLength={500}
              placeholder="Add a note about this transaction"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <label>Transaction date</label>
            <input
              type="date"
              required
              value={form.transaction_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  transaction_date: e.target.value,
                })
              }
            />

            <button
              className="lb-primary-button lb-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingTransaction
                  ? "Save Changes"
                  : "Save Transaction"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, amount, icon, color, footer }) {
  return (
    <div className="lb-stat-card">
      <div className="lb-stat-top">
        <span>{title}</span>
        <span className={`lb-stat-icon ${color}`}>{icon}</span>
      </div>
      <h2>{amount}</h2>
      <div className="lb-stat-footer">{footer}</div>
    </div>
  );
}

function BudgetItem({ budget, large = false }) {
  const percentage = Math.round((budget.spent / budget.limit) * 100);

  return (
    <div className={large ? "lb-budget-large" : "lb-budget-item"}>
      <div className="lb-budget-info">
        <span>{budget.icon} {budget.name}</span>
        <strong>
          {money(budget.spent)} <small>/ {money(budget.limit)}</small>
        </strong>
      </div>

      <div className="lb-progress-track">
        <div
          className="lb-progress-fill"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            background: budget.color,
          }}
        />
      </div>

      {large && <p>{percentage}% of budget used</p>}
    </div>
  );
}

function GoalCard({ icon, title, saved, target }) {
  return (
    <div className="lb-goal-card">
      <span>{icon}</span>
      <h3>{title}</h3>
      <strong>{money(saved)} / {money(target)}</strong>
      <div className="lb-progress-track">
        <div
          className="lb-progress-fill"
          style={{
            width: `${Math.min((saved / target) * 100, 100)}%`,
            background: "#159B72",
          }}
        />
      </div>
    </div>
  );
}

function ReportCard({ title, value }) {
  return (
    <div>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  deletingId,
}) {
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
                  <span className="lb-transaction-icon">
                    {transaction.icon}
                  </span>
                  <strong>{transaction.title}</strong>
                </div>
              </td>

              <td>
                <span className="lb-category">
                  {transaction.category}
                </span>
              </td>

              <td>{transaction.date}</td>

              <td
                className={
                  transaction.type === "income"
                    ? "lb-income-text"
                    : "lb-expense-text"
                }
              >
                {transaction.type === "income" ? "+" : "-"}
                {money(transaction.amount)}
              </td>

              <td>
                <div className="lb-transaction-actions">
                  <button
                    type="button"
                    className="lb-edit"
                    onClick={() => onEdit(transaction)}
                    title="Edit transaction"
                    aria-label={`Edit ${transaction.title}`}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="lb-delete"
                    onClick={() => onDelete(transaction.id)}
                    title="Delete transaction"
                    aria-label={`Delete ${transaction.title}`}
                    disabled={deletingId === transaction.id}
                  >
                    {deletingId === transaction.id ? "..." : "×"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
