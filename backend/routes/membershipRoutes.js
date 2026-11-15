const express = require("express");
const router = express.Router();

const {
  getMemberships,
  addMembership,
  updateMembership,
  deleteMembership,
} = require("../controllers/membershipController");

router.get("/", getMemberships);
router.post("/", addMembership);
router.put("/:id", updateMembership);
router.delete("/:id", deleteMembership);

module.exports = router;