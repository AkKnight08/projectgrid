const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Register new user
const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    
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
    
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Auto-generate display name from the full name
        const displayName = generateDisplayName(name);
        console.log(`Auto-generating display name: ${name} -> ${displayName}`);

        user = new User({ 
            name, 
            displayName, 
            email, 
            password 
        });

        await user.save();

        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
        
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const message = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-size: 24px; color: #1a202c;">Verify Your Email Address</h1>
                </div>
                <p>Hi ${user.name},</p>
                <p>Thanks for getting started with our app! To complete your registration, please click the button below to verify your email address.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">Verify Email Now</a>
                </div>
                <p>This verification link will expire in <strong>10 minutes</strong>.</p>
                <p>If you did not sign up for this account, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="font-size: 12px; color: #777; text-align: center;">If you're having trouble with the button above, copy and paste this URL into your web browser:</p>
                <p style="font-size: 12px; color: #777; text-align: center; word-break: break-all;">${verifyUrl}</p>
            </div>
        `;

        try {
            await sendEmail({ to: user.email, subject: 'Email Verification', html: message });
            res.status(201).json({ success: true, message: 'Verification email sent.' });

        } catch (err) {
            console.error('Registration email sending failed:', err);
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).send('Email could not be sent.');
        }

    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).send('Server error');
    }
};

// Login user
const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        if (!user.isEmailVerified) {
            return res.status(403).json({ 
                message: 'Your account has not been verified. Please check your email.',
                code: 'EMAIL_NOT_VERIFIED'
            });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.json({ token, user });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server error');
    }
};

// Get current user
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        console.log('getMe - User data being returned:', {
            id: user._id,
            name: user.name,
            displayName: user.displayName,
            email: user.email
        });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const verifyEmail = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() },
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
        
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Email verified successfully'
        });

    } catch (err) {
        console.error('Email verification error:', err);
        res.status(500).json({ message: 'Server error during email verification' });
    }
};

const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ success: true, message: 'If an account with this email exists, a new verification link has been sent.' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'This account is already verified.' });
        }
        
        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const message = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-size: 24px; color: #1a202c;">Verify Your Email Address</h1>
                </div>
                <p>Hi ${user.name},</p>
                <p>We received a request to resend the verification email for your account. Please click the button below to complete your registration.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">Verify Email Now</a>
                </div>
                <p>This new verification link will expire in <strong>10 minutes</strong>.</p>
                <p>If you did not request this, you can safely ignore this email.</p>
            </div>
        `;
        
        await sendEmail({
            to: user.email,
            subject: 'Resend: Email Verification',
            html: message
        });

        res.status(200).json({ success: true, message: 'A new verification link has been sent to your email address.' });

    } catch (err) {
        console.error('Resend verification email error:', err);
        res.status(500).send('Server error');
    }
};

module.exports = {
    register,
    login,
    getMe,
    verifyEmail,
    resendVerificationEmail
}; 