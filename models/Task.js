const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    checklist: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Checklist',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;