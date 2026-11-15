
const express = require("express");
const router = express.Router();

const {
  login,
  registerMember,
  createStaff
} = require("../controllers/authController");

const {
  verifyToken,
  authorizeRoles
} = require("../middleware/authMiddleware");

// Common Login - Admin, Staff, Member
router.post("/login", login);

// Public Registration - Only Member
router.post("/register", registerMember);

// Admin Only - Create Staff
router.post(
  "/staff",
  verifyToken,
  authorizeRoles("admin"),
  createStaff
);

module.exports = router;
