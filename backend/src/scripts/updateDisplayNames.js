const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/planning-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to generate display name from full name
const generateDisplayName = (fullName) => {
  if (!fullName) return '';
  
  // Remove extra spaces and split by space
  const nameParts = fullName.trim().split(/\s+/);
  
  if (nameParts.length === 1) {
    // Single name - use as is
    return nameParts[0];
  } else if (nameParts.length === 2) {
    // First and last name - use first letter of first name + last name
    return `${nameParts[0][0]}${nameParts[1]}`;
  } else {
    // Multiple names - use first letter of first name + last name
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1]}`;
  }
};

// Update users without displayName
const updateDisplayNames = async () => {
  try {
    console.log('Starting displayName update...');
    
    // Find all users where displayName is undefined or null
    const usersToUpdate = await User.find({
      $or: [
        { displayName: { $exists: false } },
        { displayName: null },
        { displayName: '' }
      ]
    });
    
    console.log(`Found ${usersToUpdate.length} users without displayName`);
    
    for (const user of usersToUpdate) {
      const generatedDisplayName = generateDisplayName(user.name);
      console.log(`Updating user ${user.email}: ${user.name} -> ${generatedDisplayName}`);
      
      user.displayName = generatedDisplayName;
      await user.save();
    }
    
    console.log('DisplayName update completed successfully!');
    
    // Show summary
    const allUsers = await User.find({});
    console.log('\nSummary:');
    allUsers.forEach(user => {
      console.log(`${user.email}: ${user.name} -> @${user.displayName}`);
    });
    
  } catch (error) {
    console.error('Error updating displayNames:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the update
updateDisplayNames(); 