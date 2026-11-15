
const Admin = require("../models/Admin");
const User = require("../models/User");
const Member = require("../models/Member");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================================
// LOGIN - ADMIN, STAFF AND MEMBER
// =====================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ADMIN LOGIN
    const admin = await Admin.findOne({
      email: normalizedEmail
    });

    if (admin) {
      const isMatch = await bcrypt.compare(
        password,
        admin.password
      );

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const token = jwt.sign(
        {
          id: admin._id,
          role: "admin"
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: "admin"
        }
      });
    }

    // STAFF / MEMBER LOGIN
    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!["staff", "member"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Invalid user role"
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Verify member profile
    if (user.role === "member") {
      if (!user.memberId) {
        return res.status(403).json({
          success: false,
          message: "Member profile not linked"
        });
      }

      const member = await Member.findById(user.memberId);

      if (!member || member.status !== "Active") {
        return res.status(403).json({
          success: false,
          message: "Member profile is inactive or not found"
        });
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        memberId: user.memberId || null
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberId: user.memberId || null
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};


// =====================================
// PUBLIC MEMBER REGISTRATION
// =====================================

const registerMember = async (req, res) => {
  let createdMemberId = null;

  try {
    const {
      name,
      email,
      phone,
      password,
      age,
      gender
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !password ||
      age === undefined ||
      age === "" ||
      !gender
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const memberAge = Number(age);

    // Correct email validation
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
    }

    // Phone validation
    if (!/^\d{10,15}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid phone number (10-15 digits)"
      });
    }

    // Age validation
    if (
      !Number.isInteger(memberAge) ||
      memberAge < 1 ||
      memberAge > 120
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid age"
      });
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    // Check email in all collections
    const [adminExists, userExists, memberExists] =
      await Promise.all([
        Admin.findOne({ email: normalizedEmail }),
        User.findOne({ email: normalizedEmail }),
        Member.findOne({ email: normalizedEmail })
      ]);

    if (adminExists || userExists || memberExists) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Member profile
    const newMember = await Member.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: cleanPhone,
      age: memberAge,
      gender,
      plan: "Basic",
      status: "Active"
    });

    createdMemberId = newMember._id;

    // Create linked User account
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "member",
      memberId: newMember._id,
      status: "Active"
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful! Please login.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        memberId: newUser.memberId
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);

    // Delete Member if User creation fails
    if (createdMemberId) {
      try {
        await Member.findByIdAndDelete(createdMemberId);
      } catch (cleanupError) {
        console.error("Member cleanup error:", cleanupError);
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
};


// =====================================
// CREATE STAFF - ADMIN ONLY
// =====================================

const createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
    }

    const [adminExists, userExists, memberExists] =
      await Promise.all([
        Admin.findOne({ email: normalizedEmail }),
        User.findOne({ email: normalizedEmail }),
        Member.findOne({ email: normalizedEmail })
      ]);

    if (adminExists || userExists || memberExists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "staff",
      status: "Active"
    });

    return res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    });

  } catch (error) {
    console.error("Staff Creation Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Staff creation failed"
    });
  }
};


// =====================================
// EXPORT
// =====================================

module.exports = {
  login,
  registerMember,
  createStaff
};
