const express = require('express');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create project
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating project with data:', req.body);
    console.log('Current user:', req.user);

    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    if (!req.user.id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Prepare project data
    const projectData = {
      name: req.body.name,
      description: req.body.description || '',
      status: req.body.status || 'active',
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      tags: req.body.tags || [],
      owner: req.user.id,
      members: [
        {
          user: req.user.id,
          role: 'admin'
        }
      ],
      settings: {
        visibility: req.body.settings?.visibility || 'private',
        allowComments: req.body.settings?.allowComments !== false
      }
    };

    // Add additional members if provided
    if (req.body.members && Array.isArray(req.body.members)) {
      // Filter out the owner and invalid members
      const additionalMembers = req.body.members
        .filter(m => m && m.user && m.user !== req.user.id)
        .map(m => ({
          user: m.user,
          role: m.role || 'member'
        }));
      
      if (additionalMembers.length > 0) {
        projectData.members.push(...additionalMembers);
      }
    }

    // Add pending members if provided
    if (req.body.pendingMembers && Array.isArray(req.body.pendingMembers)) {
      projectData.pendingMembers = req.body.pendingMembers
        .filter(m => m && m.email) // Only include valid pending members
        .map(member => ({
          email: member.email,
          role: member.role || 'member',
          invitedAt: new Date()
        }));
    }

    console.log('Final project data:', projectData);

    // Create the project
    const project = new Project(projectData);
    await project.save();

    // Populate owner and members before sending response
    await project.populate([
      { path: 'owner', select: 'email displayName' },
      { path: 'members.user', select: 'email displayName' }
    ]);

    console.log('Project created successfully:', project);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      message: 'Failed to create project',
      error: error.message 
    });
  }
});

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching projects for user:', req.user._id);
    
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('owner', 'displayName email')
      .populate('members.user', 'displayName email');

    console.log('Found projects:', projects.length);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    }).populate('owner', 'displayName email')
      .populate('members.user', 'displayName email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project' });
  }
});

// Update project
router.patch('/:id', auth, async (req, res) => {
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

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'status', 'startDate', 'endDate', 'tags', 'settings', 'layout'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => {
      project[update] = req.body[update];
    });

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project' });
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