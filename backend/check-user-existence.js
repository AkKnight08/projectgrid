const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const emailToCheck = process.argv[2];

if (!emailToCheck) {
    console.log('Please provide an email address to check.');
    process.exit(1);
}

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flow-manager', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: emailToCheck });

        if (user) {
            console.log(`✅ User found:`, user);
        } else {
            console.log(`❌ User with email ${emailToCheck} not found.`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

checkUser(); 