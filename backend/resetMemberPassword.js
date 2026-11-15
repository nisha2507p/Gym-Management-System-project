
require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const resetPassword = async () => {
  try {
    await connectDB();

    const email = "nishaap@gmail.com";
    const newPassword = "FitZone@12345";

    const user = await User.findOne({ email });

    if (!user) {
      console.log("Member account not found!");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    console.log("Password reset successful!");
    console.log("Email:", email);
    console.log("New Password:", newPassword);

    process.exit(0);

  } catch (error) {
    console.error("Password Reset Error:", error);
    process.exit(1);
  }
};

resetPassword();
