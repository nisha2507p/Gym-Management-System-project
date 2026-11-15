
const jwt = require("jsonwebtoken");

// =====================================
// VERIFY JWT TOKEN
// =====================================
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("AUTHENTICATED USER:", {
      id: decoded.id,
      role: decoded.role,
      memberId: decoded.memberId
    });

    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    const allowedRoles = ["admin", "staff", "member"];
    const userRole = String(decoded.role).toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Invalid user role"
      });
    }

    req.user = {
      ...decoded,
      role: userRole
    };

    if (userRole === "admin") {
      req.admin = req.user;
    }

    next();

  } catch (error) {
    console.error("TOKEN ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

// =====================================
// ROLE AUTHORIZATION
// =====================================
const authorizeRoles = (...roles) => {
  return (req, res, next) => {

    console.log("ROLE CHECK:", {
      actualRole: req.user?.role,
      allowedRoles: roles
    });

    const userRole = String(req.user?.role || "").toLowerCase();

    const permittedRoles = roles.map(role =>
      String(role).toLowerCase()
    );

    if (!req.user || !permittedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't have permission.",
        actualRole: userRole,
        allowedRoles: permittedRoles
      });
    }

    next();
  };
};

// =====================================
// ADMIN ONLY
// =====================================
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    authorizeRoles("admin")(req, res, next);
  });
};

// =====================================
// ADMIN AND STAFF
// =====================================
const verifyAdminStaff = (req, res, next) => {
  verifyToken(req, res, () => {
    authorizeRoles("admin", "staff")(req, res, next);
  });
};

module.exports = {
  verifyToken,
  authorizeRoles,
  verifyAdmin,
  verifyAdminStaff
};
