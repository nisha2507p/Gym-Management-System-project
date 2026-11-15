
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    paymentDate: {
      type: Date,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Cheque"],
      required: true
    },

    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Paid"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
