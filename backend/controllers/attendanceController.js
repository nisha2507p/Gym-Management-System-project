
const Attendance = require("../models/Attendance");

// Get all attendance records
exports.getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({
      date: -1
    });

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { memberName, date, status } = req.body;

    if (!memberName || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status"
      });
    }

    const record = await Attendance.create({
      memberName,
      date,
      status
    });

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete attendance
exports.deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(
      req.params.id
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    res.json({
      success: true,
      message: "Attendance deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
