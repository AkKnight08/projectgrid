const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const userEmailToDelete = process.argv[2];

if (!userEmailToDelete) {
    console.log('Please provide an email address to delete.');
    process.exit(1);
}

async function deleteUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flow-manager', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Delete the specific user
        const result = await User.deleteOne({ email: userEmailToDelete });
        
        if (result.deletedCount > 0) {
            console.log(`✅ User ${userEmailToDelete} deleted successfully`);
        } else {
            console.log(`⚠️ User ${userEmailToDelete} not found.`);
        }

        // Verify deletion
        const userExists = await User.findOne({ email: userEmailToDelete });
        if (!userExists) {
            console.log(`✅ Confirmed: User no longer exists in database`);
        } else {
            console.log(`❌ Error: User still exists in database`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

deleteUser(); 