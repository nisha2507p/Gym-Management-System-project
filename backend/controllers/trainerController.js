
const Trainer = require("../models/Trainer");

// Get all trainers
exports.getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: trainers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add trainer
exports.addTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.create(req.body);

    res.status(201).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update trainer
exports.updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found"
      });
    }

    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete trainer
exports.deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Trainer deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
