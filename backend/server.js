
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const createAdmin = require("./config/createAdmin");

const memberRoutes = require("./routes/memberRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const { verifyAdmin } = require("./middleware/authMiddleware");

const app = express();

// =====================================
// MIDDLEWARE
// =====================================
app.use(cors());
app.use(express.json());

// =====================================
// MAIN ROUTE
// =====================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Gym Management Backend is Running!"
  });
});

// =====================================
// AUTHENTICATION ROUTES
// =====================================
app.use("/api/auth", authRoutes);

// =====================================
// MEMBER ROUTES
// =====================================
app.use("/api/members", memberRoutes);

// =====================================
// TRAINER ROUTES - ADMIN ONLY
// =====================================
app.use("/api/trainers", verifyAdmin, trainerRoutes);

// =====================================
// PAYMENT ROUTES
// Role protection is inside paymentRoutes.js
// Member can view own payments
// Admin and Staff can manage all payments
// =====================================
app.use("/api/payments", paymentRoutes);

// =====================================
// MEMBERSHIP ROUTES - ADMIN ONLY
// =====================================
app.use("/api/memberships", verifyAdmin, membershipRoutes);

// =====================================
// ATTENDANCE ROUTES
// =====================================
app.use("/api/attendance", attendanceRoutes);

// =====================================
// START SERVER
// =====================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await createAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
  }
};

startServer();
