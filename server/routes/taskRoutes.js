const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// Apply protection to all task routes
router.use(protect);

// @route   GET /api/tasks
// @desc    Get all tasks for logged in user (with filter/search support)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, search, sortBy } = req.query;

    let query = { user: req.user._id };

    // Status filter
    if (status === 'completed') {
      query.completed = true;
    } else if (status === 'pending') {
      query.completed = false;
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Priority filter
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest first
    if (sortBy === 'dueDate') {
      sortOptions = { dueDate: 1, createdAt: -1 };
    } else if (sortBy === 'priority') {
      sortOptions = { priority: -1, createdAt: -1 };
    } else if (sortBy === 'title') {
      sortOptions = { title: 1 };
    }

    const tasks = await Task.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tasks' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, description, category, priority, dueDate } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category || 'General',
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating task' });
  }
});

// @route   DELETE /api/tasks/completed
// @desc    Clear all completed tasks for user
// @access  Private
router.delete('/completed', async (req, res) => {
  try {
    const result = await Task.deleteMany({ user: req.user._id, completed: true });
    res.json({
      success: true,
      message: `${result.deletedCount} completed tasks cleared`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Clear completed error:', error);
    res.status(500).json({ success: false, message: 'Server error clearing completed tasks' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching task' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task details
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { title, description, completed, category, priority, dueDate } = req.body;

    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (completed !== undefined) task.completed = completed;
    if (category !== undefined) task.category = category;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await task.save();

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Server error updating task' });
  }
});

// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle task completion status
// @access  Private
router.patch('/:id/toggle', async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.completed = !task.completed;
    const updatedTask = await task.save();

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ success: false, message: 'Server error toggling task status' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: task,
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
});

module.exports = router;
