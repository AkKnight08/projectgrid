const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create sample user
    const user = await User.create({
      email: 'thisisakshayk@gmail.com',
      password: 'Akshay1234',
      displayName: 'Akshay Kumar',
      role: 'admin',
    });
    console.log('Created sample user');

    // Create sample projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Redesign the company website with modern UI/UX',
      owner: user._id,
      members: [{ user: user._id, role: 'admin' }],
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      tags: ['design', 'frontend', 'ui/ux'],
    });

    const project2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Develop a new mobile app for iOS and Android',
      owner: user._id,
      members: [{ user: user._id, role: 'admin' }],
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      tags: ['mobile', 'development', 'ios', 'android'],
    });
    console.log('Created sample projects');

    // Create sample tasks
    const tasks = await Task.create([
      {
        title: 'Design Homepage',
        description: 'Create new homepage design with modern aesthetics',
        project: project1._id,
        assignee: user._id,
        creator: user._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        estimatedHours: 16,
        tags: ['design', 'homepage'],
      },
      {
        title: 'Implement Navigation',
        description: 'Implement responsive navigation menu',
        project: project1._id,
        assignee: user._id,
        creator: user._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        estimatedHours: 8,
        tags: ['frontend', 'navigation'],
      },
      {
        title: 'Setup React Native',
        description: 'Initialize React Native project with necessary configurations',
        project: project2._id,
        assignee: user._id,
        creator: user._id,
        status: 'done',
        priority: 'high',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        estimatedHours: 4,
        actualHours: 5,
        tags: ['setup', 'react-native'],
      },
      {
        title: 'Design App Screens',
        description: 'Create wireframes and mockups for main app screens',
        project: project2._id,
        assignee: user._id,
        creator: user._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        estimatedHours: 20,
        tags: ['design', 'wireframes'],
      },
    ]);
    console.log('Created sample tasks');

    console.log('Sample data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 