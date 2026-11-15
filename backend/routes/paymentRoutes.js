
const express = require("express");
const router = express.Router();

const {
  getPayments,
  getMyPayments,
  addPayment,
  updatePayment,
  deletePayment
} = require("../controllers/paymentController");

const {
  verifyToken,
  authorizeRoles
} = require("../middleware/authMiddleware");

// MEMBER - OWN PAYMENT HISTORY
router.get(
  "/my",
  verifyToken,
  authorizeRoles("member"),
  getMyPayments
);

// ADMIN AND STAFF - ALL PAYMENTS
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "staff"),
  getPayments
);

// ADMIN AND STAFF - ADD PAYMENT
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "staff"),
  addPayment
);

// ADMIN AND STAFF - UPDATE PAYMENT
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "staff"),
  updatePayment
);

// ADMIN AND STAFF - DELETE PAYMENT
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "staff"),
  deletePayment
);

module.exports = router;
