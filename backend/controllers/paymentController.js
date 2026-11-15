
const Payment = require("../models/Payment");

// =====================================
// GET ALL PAYMENTS - ADMIN AND STAFF
// =====================================
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("member", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =====================================
// GET MY PAYMENTS - MEMBER
// =====================================
exports.getMyPayments = async (req, res) => {
  try {
    const memberId = req.user.memberId;

    console.log("LOGGED IN USER:", req.user);
    console.log("MEMBER ID:", memberId);

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member profile not linked"
      });
    }

    const payments = await Payment.find({
      member: memberId
    })
      .populate("member", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (error) {
    console.error("GET MY PAYMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =====================================
// ADD PAYMENT - ADMIN AND STAFF
// =====================================
exports.addPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    const savedPayment = await Payment.findById(payment._id)
      .populate("member", "name");

    return res.status(201).json({
      success: true,
      data: savedPayment
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// =====================================
// UPDATE PAYMENT - ADMIN AND STAFF
// =====================================
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate("member", "name");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// =====================================
// DELETE PAYMENT - ADMIN AND STAFF
// =====================================
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(
      req.params.id
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully"
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
