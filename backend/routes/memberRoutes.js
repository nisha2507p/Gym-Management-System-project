
const express = require("express");
const router = express.Router();

const {
  addMember,
  getMembers,
  getMember,
  getMyProfile,
  getMyPayments,
  updateMember,
  deleteMember
} = require("../controllers/memberController");

const {
  verifyToken,
  authorizeRoles
} = require("../middleware/authMiddleware");

// Admin and Staff: View all members
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "staff"),
  getMembers
);

// Admin and Staff: Add member
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "staff"),
  addMember
);

// Member: View own profile
router.get(
  "/my-profile",
  verifyToken,
  authorizeRoles("member"),
  getMyProfile
);

// Member: View own payment history
router.get(
  "/my-payments",
  verifyToken,
  authorizeRoles("member"),
  getMyPayments
);

// Admin, Staff and Member: View single member
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "staff", "member"),
  getMember
);

// Admin, Staff and Member: Update member
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "staff", "member"),
  updateMember
);

// Admin only: Delete member
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteMember
);

module.exports = router;
