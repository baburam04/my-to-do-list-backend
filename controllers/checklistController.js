const Checklist = require('../models/Checklist');
const asyncHandler = require('express-async-handler');

// @desc    Get all checklists for a user
// @route   GET /api/checklists
// @access  Private
const getChecklists = asyncHandler(async (req, res) => {
  const checklists = await Checklist.find({ user: req.user._id }).sort({
    pinned: -1,
    createdAt: -1,
  });
  res.json(checklists);
});

// @desc    Create a checklist
// @route   POST /api/checklists
// @access  Private
const createChecklist = asyncHandler(async (req, res) => {
  const { title, pinned } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Please provide a title');
  }

  const checklist = await Checklist.create({
    user: req.user._id,
    title,
    pinned: pinned || false,
  });

  res.status(201).json(checklist);
});

// @desc    Delete a checklist
// @route   DELETE /api/checklists/:id
// @access  Private
const deleteChecklist = asyncHandler(async (req, res) => {
  const checklist = await Checklist.findById(req.params.id);

  if (!checklist) {
    res.status(404);
    throw new Error('Checklist not found');
  }

  // Check if the checklist belongs to the user
  if (checklist.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this checklist');
  }

  await checklist.deleteOne();
  res.json({ message: 'Checklist removed' });
});

// @desc    Toggle checklist pinned status
// @route   PUT /api/checklists/:id/pin
// @access  Private
const togglePinChecklist = asyncHandler(async (req, res) => {
  const checklist = await Checklist.findById(req.params.id);

  if (!checklist) {
    res.status(404);
    throw new Error('Checklist not found');
  }

  // Check if the checklist belongs to the user
  if (checklist.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to modify this checklist');
  }

  checklist.pinned = !checklist.pinned;
  const updatedChecklist = await checklist.save();

  res.json(updatedChecklist);
});

// @desc    Search checklists
// @route   GET /api/checklists/search
// @access  Private
const searchChecklists = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    throw new Error('Please provide a search query');
  }

  const checklists = await Checklist.find({
    user: req.user._id,
    title: { $regex: query, $options: 'i' },
  }).sort({ pinned: -1, createdAt: -1 });

  res.json(checklists);
});

module.exports = {
  getChecklists,
  createChecklist,
  deleteChecklist,
  togglePinChecklist,
  searchChecklists,
};