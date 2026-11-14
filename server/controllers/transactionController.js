
const pool = require("../config/database");

// Get the logged-in user's ID from their session
function getUserId(req) {
  return req.session?.userId;
}

// Validate transaction data
function validateTransaction(data, requireAll = true) {
  const {
    title,
    amount,
    type,
    category,
    transaction_date,
  } = data;

  if (
    requireAll &&
    (!title || amount === undefined || !type || !category)
  ) {
    return "Title, amount, type and category are required.";
  }

  if (
    title !== undefined &&
    (
      typeof title !== "string" ||
      title.trim().length < 1 ||
      title.trim().length > 100
    )
  ) {
    return "Title must contain between 1 and 100 characters.";
  }

  if (amount !== undefined) {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return "Amount must be a number greater than zero.";
    }
  }

  if (
    type !== undefined &&
    !["income", "expense"].includes(type)
  ) {
    return "Type must be either income or expense.";
  }

  if (
    category !== undefined &&
    (
      typeof category !== "string" ||
      category.trim().length < 1 ||
      category.trim().length > 50
    )
  ) {
    return "Category must contain between 1 and 50 characters.";
  }

  if (transaction_date !== undefined) {
    if (
      typeof transaction_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date) ||
      Number.isNaN(Date.parse(`${transaction_date}T00:00:00Z`))
    ) {
      return "Please provide a valid transaction date in YYYY-MM-DD format.";
    }
  }

  return null;
}

// GET /api/transactions
async function getTransactions(req, res) {
  const userId = getUserId(req);

  try {
    const result = await pool.query(
      `SELECT id, user_id, title, amount, type, category,
              description, transaction_date, created_at, updated_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY transaction_date DESC, id DESC`,
      [userId]
    );

    return res.json({
      success: true,
      count: result.rows.length,
      transactions: result.rows,
    });
  } catch (error) {
    console.error("Get transactions error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve transactions.",
    });
  }
}

// POST /api/transactions
async function createTransaction(req, res) {
  const userId = getUserId(req);

  const validationError = validateTransaction(req.body);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  const {
    title,
    amount,
    type,
    category,
    description = null,
    transaction_date,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO transactions
        (user_id, title, amount, type, category, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::date, CURRENT_DATE))
       RETURNING id, user_id, title, amount, type, category,
                 description, transaction_date, created_at, updated_at`,
      [
        userId,
        title.trim(),
        Number(amount),
        type,
        category.trim(),
        description,
        transaction_date || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully.",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error("Create transaction error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create transaction.",
    });
  }
}

// PUT /api/transactions/:id
async function updateTransaction(req, res) {
  const userId = getUserId(req);
  const transactionId = Number(req.params.id);

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid transaction ID.",
    });
  }

  const validationError = validateTransaction(req.body);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  const {
    title,
    amount,
    type,
    category,
    description = null,
    transaction_date,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET title = $1,
           amount = $2,
           type = $3,
           category = $4,
           description = $5,
           transaction_date = COALESCE($6::date, transaction_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING id, user_id, title, amount, type, category,
                 description, transaction_date, created_at, updated_at`,
      [
        title.trim(),
        Number(amount),
        type,
        category.trim(),
        description,
        transaction_date || null,
        transactionId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.json({
      success: true,
      message: "Transaction updated successfully.",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error("Update transaction error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not update transaction.",
    });
  }
}

// DELETE /api/transactions/:id
async function deleteTransaction(req, res) {
  const userId = getUserId(req);
  const transactionId = Number(req.params.id);

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid transaction ID.",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM transactions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [transactionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    console.error("Delete transaction error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not delete transaction.",
    });
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
