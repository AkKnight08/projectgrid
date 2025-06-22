const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: __dirname + '/../../.env' });


const checkUserCount = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Error: MONGODB_URI is not defined in your environment variables.');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Successfully connected to MongoDB.');

    const userCount = await User.countDocuments();
    
    console.log('--- User Count ---');
    console.log(`There are currently ${userCount} users in the database.`);
    console.log('------------------');

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

checkUserCount(); 