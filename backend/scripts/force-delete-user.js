const mongoose = require('mongoose');
const User = require('../src/models/User');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const email = process.argv[2];

if (!email) {
    console.log('Usage: node force-delete-user.js <email>');
    process.exit(1);
}

async function forceDeleteUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        const result = await User.deleteOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (result.deletedCount > 0) {
            console.log(`Successfully deleted user: ${email}`);
        } else {
            console.log(`User with email ${email} not found.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

forceDeleteUser(); 