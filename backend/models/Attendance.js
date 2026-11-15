
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    memberName: {
      type: String,
      required: true,
      trim: true
    },

    date: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);
