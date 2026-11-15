
const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    memberName: {
      type: String,
      required: true,
      trim: true,
    },

    plan: {
      type: String,
      enum: ["Monthly", "Quarterly", "Yearly"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Expired"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Membership", membershipSchema);
