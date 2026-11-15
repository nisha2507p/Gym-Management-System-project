
const express = require("express");
const router = express.Router();

const {
  getTrainers,
  addTrainer,
  updateTrainer,
  deleteTrainer
} = require("../controllers/trainerController");

router.get("/", getTrainers);
router.post("/", addTrainer);
router.put("/:id", updateTrainer);
router.delete("/:id", deleteTrainer);

module.exports = router;
