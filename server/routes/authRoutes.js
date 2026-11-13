
const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getCurrentUser,
  logout,
} = require("../controllers/authController");

// Register new user
router.post("/signup", signup);

// Login existing user
router.post("/login", login);

// Get currently logged-in user
router.get("/me", getCurrentUser);

// Logout user
router.post("/logout", logout);

module.exports = router;
