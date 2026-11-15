const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    specialization: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    salary: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trainer", trainerSchema);