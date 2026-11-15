
const express = require("express");
const router = express.Router();

const { verifyAdmin } = require("../middleware/authMiddleware");
const {
  getAttendance,
  markAttendance,
  deleteAttendance
} = require("../controllers/attendanceController");

// All routes require Admin JWT
router.get("/", verifyAdmin, getAttendance);

router.post("/", verifyAdmin, markAttendance);

router.delete("/:id", verifyAdmin, deleteAttendance);

module.exports = router;
