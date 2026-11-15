
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Admin credentials missing in .env");
  }

  let admin = await Admin.findOne({ role: "admin" });

  if (!admin) {
    const hashedPassword = await bcrypt.hash(password, 12);

    admin = await Admin.create({
      name: "Gym Admin",
      email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin account created:", admin.email);
    return;
  }

  const isSamePassword = await bcrypt.compare(
    password,
    admin.password
  );

  if (admin.email !== email || !isSamePassword) {
    admin.email = email;
    admin.password = await bcrypt.hash(password, 12);
    await admin.save();
  }

  console.log("Admin account verified:", admin.email);
};

module.exports = createAdmin;
