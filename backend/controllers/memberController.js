
const Member = require("../models/Member");
const User = require("../models/User");
const Payment = require("../models/Payment");
const mongoose = require("mongoose");

// Allowed fields
const memberFields = [
  "name",
  "email",
  "phone",
  "age",
  "gender",
  "plan",
  "status",
  "joinDate",
  "expiryDate",
  "fee"
];

// ADD MEMBER
exports.addMember = async (req, res) => {
  try {
    if (!["admin", "staff"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const data = {};

    memberFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    });

    const member = await Member.create(data);

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: member
    });

  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message: error.code === 11000
        ? "Email already exists"
        : error.message
    });
  }
};

// GET ALL MEMBERS
exports.getMembers = async (req, res) => {
  try {
    if (!["admin", "staff"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const members = await Member.find().sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SINGLE MEMBER
exports.getMember = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID"
      });
    }

    if (
      req.user.role === "member" &&
      String(req.user.memberId) !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can access only your own profile"
      });
    }

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    res.status(200).json({
      success: true,
      data: member
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET MY PROFILE
exports.getMyProfile = async (req, res) => {
  try {
    if (req.user.role !== "member") {
      return res.status(403).json({
        success: false,
        message: "Only members can access this profile"
      });
    }

    if (!req.user.memberId) {
      return res.status(403).json({
        success: false,
        message: "Member profile is not linked"
      });
    }

    const member = await Member.findById(req.user.memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Member profile fetched successfully",
      data: member
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET MY PAYMENTS
exports.getMyPayments = async (req, res) => {
  try {
    if (req.user.role !== "member") {
      return res.status(403).json({
        success: false,
        message: "Only members can access their payments"
      });
    }

    if (!req.user.memberId) {
      return res.status(403).json({
        success: false,
        message: "Member profile is not linked"
      });
    }

    const payments = await Payment.find({
      member: req.user.memberId
    }).sort({
      paymentDate: -1
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE MEMBER
exports.updateMember = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID"
      });
    }

    const role = req.user.role;

    if (
      role === "member" &&
      String(req.user.memberId) !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own profile"
      });
    }

    const allowedFields =
      role === "admin"
        ? memberFields
        : role === "staff"
        ? [
            "name",
            "phone",
            "age",
            "gender",
            "plan",
            "status",
            "expiryDate"
          ]
        : [
            "name",
            "phone",
            "age",
            "gender"
          ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No allowed fields provided for update"
      });
    }

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    if (role === "member" && updateData.name) {
      await User.updateOne(
        { memberId: member._id },
        { $set: { name: member.name } }
      );
    }

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: member
    });

  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE MEMBER - ADMIN ONLY
exports.deleteMember = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin can delete members"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID"
      });
    }

    const member = await Member.findByIdAndDelete(
      req.params.id
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    await User.deleteOne({
      memberId: member._id,
      role: "member"
    });

    res.status(200).json({
      success: true,
      message: "Member deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
