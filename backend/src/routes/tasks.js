const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.body.project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = new Task({
      ...req.body,
      creator: req.user._id,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Get tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'displayName email')
      .populate('creator', 'displayName email');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    // First get all projects the user has access to
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    });

    // Get all tasks from these projects
    const tasks = await Task.find({
      project: { $in: projects.map(p => p._id) }
    })
    .populate('assignee', 'displayName email')
    .populate('creator', 'displayName email')
    .populate('project', 'name status');

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    res.status(500).json({
      message: error.message || 'Error fetching all tasks',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'displayName email')
      .populate('creator', 'displayName email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'title',
      'description',
      'status',
      'priority',
      'dueDate',
      'estimatedHours',
      'actualHours',
      'tags',
      'attachments',
    ];

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => {
      task[update] = req.body[update];
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' },
      ],
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Also remove the task reference from the project
    await Project.findByIdAndUpdate(task.project, { $pull: { tasks: task._id } });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Add comment to task
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.comments.push({
      text: req.body.text,
      user: req.user._id,
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Remove comment from task
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.comments = task.comments.filter(
      comment => comment._id.toString() !== req.params.commentId
    );

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error removing comment' });
  }
});

module.exports = router; 