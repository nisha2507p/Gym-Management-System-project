
const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true
    },

    age: {
      type: Number,
      required: true
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true
    },

    plan: {
  type: String,
  enum: ["Basic", "Premium", "Pro", "Gold"],
  default: "Basic"
},

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },

    joinDate: {
      type: Date,
      default: Date.now
    },

    expiryDate: {
      type: Date
    },

    fee: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Member", memberSchema);
