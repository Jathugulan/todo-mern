const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All task routes require authentication
router.use(protect);

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.route('/')
  .get(getTasks)
  .post(createTask);

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
// @route   PUT /api/tasks/:id
// @desc    Update task by ID
// @access  Private
// @route   DELETE /api/tasks/:id
// @desc    Delete task by ID
// @access  Private
router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
