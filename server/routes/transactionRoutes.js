
const express = require("express");
const router = express.Router();

const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

// Protect all transaction routes
function requireLogin(req, res, next) {
  // Must match the property set during login:
  // req.session.userId = user.id
  if (!req.session?.userId) {
    return res.status(401).json({
      success: false,
      message: "Please log in to access your transactions.",
    });
  }

  next();
}

// All routes below require authentication
router.use(requireLogin);

// Get all transactions
router.get("/", getTransactions);

// Create a transaction
router.post("/", createTransaction);

// Update a transaction
router.put("/:id", updateTransaction);

// Delete a transaction
router.delete("/:id", deleteTransaction);

module.exports = router;
