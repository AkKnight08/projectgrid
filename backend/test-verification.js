const mongoose = require('mongoose');
const User = require('./src/models/User');
const crypto = require('crypto');
require('dotenv').config();

async function testVerification() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskgrid', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Find the specific user
        const user = await User.findOne({ email: '2021uec1560@mnit.ac.in' });
        
        if (user) {
            console.log('Found user:', user.email);
            console.log('User ID:', user._id);
            console.log('Is email verified:', user.isEmailVerified);
            console.log('Has verification token:', !!user.emailVerificationToken);
            console.log('Token expires:', user.emailVerificationExpires);
            console.log('Is token expired:', user.emailVerificationExpires ? user.emailVerificationExpires < Date.now() : 'No token');
            console.log('Created at:', user.createdAt);
            console.log('Updated at:', user.updatedAt);
            
            if (user.emailVerificationToken) {
                console.log('Verification token hash:', user.emailVerificationToken);
            }
        } else {
            console.log('User not found');
        }

        // Test the specific token from the error
        const testToken = 'dfc89cdc75c8f6d652bf2d9345a52e495e5b24e7';
        const hashedToken = crypto
            .createHash('sha256')
            .update(testToken)
            .digest('hex');
        
        console.log('\nTesting token:', testToken);
        console.log('Hashed token:', hashedToken);
        
        const userWithToken = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() },
        });
        
        if (userWithToken) {
            console.log('✅ Found user with this token:', userWithToken.email);
        } else {
            console.log('❌ No user found with this token');
            
            // Check if any user has this token (even if expired)
            const userWithExpiredToken = await User.findOne({
                emailVerificationToken: hashedToken,
            });
            
            if (userWithExpiredToken) {
                console.log('⚠️ Found user with expired token:', userWithExpiredToken.email);
                console.log('Token expired at:', userWithExpiredToken.emailVerificationExpires);
                console.log('Current time:', new Date());
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testVerification(); 