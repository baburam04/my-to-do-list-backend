const Task = require('../models/Task');
const Checklist = require('../models/Checklist');
const asyncHandler = require('express-async-handler');

// @desc    Get all tasks for a checklist
// @route   GET /api/checklists/:checklistId/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  // First verify the checklist belongs to the user
  const checklist = await Checklist.findOne({
    _id: req.params.checklistId,
    user: req.user._id,
  });

  if (!checklist) {
    res.status(404);
    throw new Error('Checklist not found or not authorized');
  }

  const tasks = await Task.find({ checklist: req.params.checklistId }).sort(
    'order'
  );
  res.json(tasks);
});

// @desc    Create a task
// @route   POST /api/checklists/:checklistId/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { description } = req.body;

  // Verify the checklist belongs to the user
  const checklist = await Checklist.findOne({
    _id: req.params.checklistId,
    user: req.user._id,
  });

  if (!checklist) {
    res.status(404);
    throw new Error('Checklist not found or not authorized');
  }

  if (!description) {
    res.status(400);
    throw new Error('Please provide a task description');
  }

  // Get the current max order to place new task at the end
  const maxOrderTask = await Task.findOne({ checklist: req.params.checklistId })
    .sort('-order')
    .select('order');
  const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

  const task = await Task.create({
    checklist: req.params.checklistId,
    description,
    order,
  });

  res.status(201).json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate({
    path: 'checklist',
    select: 'user',
  });

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if the task's checklist belongs to the user
  if (task.checklist.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to modify this task');
  }

  // Update only the fields that are passed in
  if (req.body.description !== undefined) {
    task.description = req.body.description;
  }

  if (req.body.completed !== undefined) {
    task.completed = req.body.completed;
  }

  if (req.body.order !== undefined) {
    task.order = req.body.order;
  }

  const updatedTask = await task.save();
  res.json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate({
    path: 'checklist',
    select: 'user',
  });

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if the task's checklist belongs to the user
  if (task.checklist.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this task');
  }

  await task.deleteOne();
  res.json({ message: 'Task removed' });
});

// @desc    Reorder tasks
// @route   PUT /api/tasks/:checklistId/reorder
// @access  Private
const reorderTasks = asyncHandler(async (req, res) => {
  const { tasks } = req.body;

  // Verify the checklist belongs to the user
  const checklist = await Checklist.findOne({
    _id: req.params.checklistId,
    user: req.user._id,
  });

  if (!checklist) {
    res.status(404);
    throw new Error('Checklist not found or not authorized');
  }

  // Update all tasks with their new order
  const bulkOps = tasks.map((task) => ({
    updateOne: {
      filter: { _id: task._id, checklist: req.params.checklistId },
      update: { $set: { order: task.order } },
    },
  }));

  await Task.bulkWrite(bulkOps);

  res.json({ message: 'Tasks reordered successfully' });
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
};