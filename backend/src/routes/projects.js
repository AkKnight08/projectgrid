const express = require('express');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');
const Task = require('../models/Task');

const router = express.Router();

// Search projects
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    console.log('Searching projects with query:', q);
    console.log('User ID:', req.user._id);

    const projects = await Project.find({
      $and: [
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ]
        },
        {
          $or: [
            { owner: req.user._id },
            { 'members.user': req.user._id }
          ]
        }
      ]
    })
    .select('name description status tags _id')
    .limit(10)
    .sort({ updatedAt: -1 });

    console.log('Found projects:', projects.length);
    res.json(projects);
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ message: 'Error searching projects' });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, tags, owner, members, pendingMembers, settings } = req.body;

    // Create the project
    const project = new Project({
      name,
      description,
      status,
      startDate,
      endDate,
      tags,
      owner,
      members,
      pendingMembers,
      settings,
      layout: {
        lg: [], md: [], sm: [], xs: [], xxs: []
      }
    });

    // Create default tasks/milestones for the project
    const defaultTasks = [
      {
        title: 'Project Planning',
        description: 'Initial project planning and setup',
        status: 'todo',
        priority: 'high',
        project: project._id,
        creator: owner,
        assignee: owner,
        startDate: startDate,
        dueDate: new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week after start
        type: 'milestone',
        done: false
      },
      {
        title: 'Development Phase',
        description: 'Main development work',
        status: 'todo',
        priority: 'high',
        project: project._id,
        creator: owner,
        assignee: owner,
        startDate: new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week after start
        dueDate: new Date(new Date(endDate).getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks before end
        type: 'milestone',
        done: false
      },
      {
        title: 'Testing and Review',
        description: 'Testing and final review phase',
        status: 'todo',
        priority: 'high',
        project: project._id,
        creator: owner,
        assignee: owner,
        startDate: new Date(new Date(endDate).getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks before end
        dueDate: new Date(new Date(endDate).getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before end
        type: 'milestone',
        done: false
      },
      {
        title: 'Final Delivery',
        description: 'Project completion and delivery',
        status: 'todo',
        priority: 'high',
        project: project._id,
        creator: owner,
        assignee: owner,
        startDate: new Date(new Date(endDate).getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before end
        dueDate: endDate,
        type: 'milestone',
        done: false
      }
    ];

    // Create the tasks
    const createdTasks = await Task.insertMany(defaultTasks);

    // Update project with task IDs
    project.tasks = createdTasks.map(task => task._id);

    // Save the project
    await project.save();

    // Populate the project with tasks and other references
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'email displayName')
      .populate('members.user', 'email displayName')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'assignee', select: 'email displayName' },
          { path: 'creator', select: 'email displayName' }
        ]
      });

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching projects for user:', req.user._id);
    
    // Find projects where user is owner or member
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'displayName email')
    .populate('members.user', 'displayName email')
    .lean();

    // Get all tasks for these projects
    const projectIds = projects.map(p => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'displayName email')
      .populate('creator', 'displayName email')
      .lean();

    // Attach tasks to their respective projects
    const projectsWithTasks = projects.map(project => {
      const projectTasks = tasks.filter(task => 
        task.project && task.project.toString() === project._id.toString()
      );
      
      // Calculate task metrics
      const taskMetrics = {
        total: projectTasks.length,
        completed: projectTasks.filter(t => t.status === 'done').length,
        inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
        todo: projectTasks.filter(t => t.status === 'todo').length,
        review: projectTasks.filter(t => t.status === 'review').length,
        overdue: projectTasks.filter(t => 
          t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()
        ).length,
        byPriority: {
          critical: projectTasks.filter(t => t.priority === 'critical').length,
          high: projectTasks.filter(t => t.priority === 'high').length,
          medium: projectTasks.filter(t => t.priority === 'medium').length,
          low: projectTasks.filter(t => t.priority === 'low').length
        }
      };

      // Calculate completion percentage
      const completionPercentage = projectTasks.length > 0
        ? (taskMetrics.completed / projectTasks.length) * 100
        : 0;

      return {
        ...project,
        tasks: projectTasks,
        taskMetrics,
        completionPercentage: Math.round(completionPercentage * 10) / 10
      };
    });

    // Calculate overall metrics
    const totalProjects = projectsWithTasks.length;
    const totalTasks = tasks.length;
    const completedProjects = projectsWithTasks.filter(p => p.status === 'completed').length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const overdueTasks = tasks.filter(t => 
      t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;

    console.log('Found projects:', totalProjects);
    res.json({
      projects: projectsWithTasks,
      metrics: {
        totalProjects,
        totalTasks,
        completedProjects,
        completedTasks,
        overdueTasks,
        completionRate: totalProjects ? (completedProjects / totalProjects) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      message: 'Error fetching projects', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'displayName email')
    .populate('members.user', 'displayName email')
    .lean();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get all tasks for this project
    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'displayName email')
      .populate('creator', 'displayName email')
      .lean();

    // Calculate task metrics
    const taskMetrics = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      review: tasks.filter(t => t.status === 'review').length,
      overdue: tasks.filter(t => 
        t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()
      ).length,
      byPriority: {
        critical: tasks.filter(t => t.priority === 'critical').length,
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
      }
    };

    // Calculate completion percentage
    const completionPercentage = tasks.length > 0
      ? (taskMetrics.completed / tasks.length) * 100
      : 0;

    res.json({
      ...project,
      tasks,
      taskMetrics,
      completionPercentage: Math.round(completionPercentage * 10) / 10
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, $or: [{ owner: req.user._id }, { 'members.user': req.user._id, 'members.role': 'admin' }] },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('owner members.user', 'displayName email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to edit it.' });
    }

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: 'Error updating project', error: error.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

// Add member to project
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const memberExists = project.members.some(member => member.user.toString() === userId);
    if (memberExists) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push({ user: userId, role });
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error adding member' });
  }
});

// Remove member from project
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.role': 'admin' },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.members = project.members.filter(
      member => member.user.toString() !== req.params.userId
    );

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error removing member' });
  }
});

module.exports = router; 