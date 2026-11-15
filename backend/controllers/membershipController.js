const Membership = require("../models/Membership");

// Get all membership plans
const getMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: memberships,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add membership plan
const addMembership = async (req, res) => {
  try {
    const membership = await Membership.create(req.body);

    res.status(201).json({
      success: true,
      data: membership,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update membership plan
const updateMembership = async (req, res) => {
  try {
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    res.status(200).json({
      success: true,
      data: membership,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete membership plan
const deleteMembership = async (req, res) => {
  try {
    const membership = await Membership.findByIdAndDelete(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Membership deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMemberships,
  addMembership,
  updateMembership,
  deleteMembership,
};