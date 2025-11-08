const express = require('express');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    validateSignup,
    validateLogin,
    validateProfileUpdate,
    rateLimitLogin,
    rateLimitStore
} = require('../middleware/validation');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/debug-signup
// @desc    Debug endpoint - shows exactly what's being sent
// @access  Public
router.post('/debug-signup', async (req, res) => {
    console.log('\n========== DEBUG SIGNUP REQUEST ==========');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Body values:');
    for (const [key, value] of Object.entries(req.body)) {
        console.log(`  ${key}: ${typeof value} = "${value}"`);
    }
    console.log('==========================================\n');

    res.json({
        message: 'Debug info logged to server console',
        received: req.body,
        bodyKeys: Object.keys(req.body)
    });
});

// @route   POST /api/auth/check-email
// @desc    Check if email is already registered
// @access  Public
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;

        // Email validation
        if (!email || !email.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: ['Email is required']
            });
        }

        if (!validator.isEmail(email.trim())) {
            return res.status(400).json({
                error: 'Validation failed',
                details: ['Please provide a valid email address']
            });
        }

        // Check if email exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

        if (existingUser) {
            return res.status(200).json({
                available: false,
                message: 'This email address is already registered. Please use a different email or try logging in.'
            });
        }

        return res.status(200).json({
            available: true,
            message: 'Email is available for registration'
        });

    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to check email availability. Please try again later.'
        });
    }
});

// @route   POST /api/auth/validate-password
// @desc    Validate password strength
// @access  Public
router.post('/validate-password', (req, res) => {
    try {
        const { password } = req.body;
        const errors = [];
        const passed = [];

        if (!password) {
            return res.status(400).json({
                error: 'Password is required'
            });
        }

        // Check minimum length
        if (password.length >= 8) {
            passed.push('At least 8 characters');
        } else {
            errors.push('Password must be at least 8 characters long');
        }

        // Check for lowercase letter
        if (/(?=.*[a-z])/.test(password)) {
            passed.push('Contains lowercase letter');
        } else {
            errors.push('Password must contain at least one lowercase letter');
        }

        // Check for uppercase letter
        if (/(?=.*[A-Z])/.test(password)) {
            passed.push('Contains uppercase letter');
        } else {
            errors.push('Password must contain at least one uppercase letter');
        }

        // Check for number
        if (/(?=.*\d)/.test(password)) {
            passed.push('Contains number');
        } else {
            errors.push('Password must contain at least one number');
        }

        // Check for special character
        if (/(?=.*[@$!%*?&])/.test(password)) {
            passed.push('Contains special character');
        } else {
            errors.push('Password must contain at least one special character (@$!%*?&)');
        }

        const isValid = errors.length === 0;
        const strength = passed.length === 5 ? 'Strong' :
            passed.length >= 3 ? 'Medium' : 'Weak';

        res.json({
            isValid,
            strength,
            passed,
            errors: errors.length > 0 ? errors : undefined,
            score: passed.length
        });

    } catch (error) {
        console.error('Password validation error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to validate password. Please try again later.'
        });
    }
});

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', validateSignup, async (req, res) => {
    try {
        const { name, email, password, userType } = req.body;

        console.log('=== SIGNUP REQUEST ===');
        console.log('Request body:', { name, email, password: '***', userType });
        console.log('Validation passed, proceeding with user creation...');

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                error: 'Registration failed',
                details: [`An account with email "${email}" already exists. Please use a different email address or try logging in.`]
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            userType
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }
        // Handle duplicate email error at database level
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            return res.status(400).json({
                error: 'Registration failed',
                details: [`An account with ${field} "${value}" already exists. Please use a different ${field} address or try logging in.`]
            });
        }
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to create account. Please try again later.'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, rateLimitLogin, async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        // Find user by email and userType
        const user = await User.findOne({ email, userType });
        if (!user) {
            // Increment failed attempts
            rateLimitStore.increment(req.rateLimitKey);
            return res.status(400).json({
                error: 'Login failed',
                details: ['Invalid email, password, or user type']
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Increment failed attempts
            rateLimitStore.increment(req.rateLimitKey);
            return res.status(400).json({
                error: 'Login failed',
                details: ['Invalid email, password, or user type']
            });
        }

        // Clear rate limit on successful login
        rateLimitStore.clear(req.rateLimitKey);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                profileImage: user.profileImage,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to process login. Please try again later.'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Build full URL for profile image if it exists
        let profileImage = user.profileImage;
        if (profileImage && profileImage.startsWith('/uploads/')) {
            const protocol = req.protocol;
            const host = req.get('host');
            profileImage = `${protocol}://${host}${profileImage}`;
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                profileImage: profileImage,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, validateProfileUpdate, async (req, res) => {
    try {
        const { name, phone, profileImage } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User account no longer exists'
            });
        }

        // Update fields
        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();

        // Build full URL for profile image if it exists
        let fullProfileImage = user.profileImage;
        if (fullProfileImage && fullProfileImage.startsWith('/uploads/')) {
            const protocol = req.protocol;
            const host = req.get('host');
            fullProfileImage = `${protocol}://${host}${fullProfileImage}`;
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                profileImage: fullProfileImage,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to update profile. Please try again later.'
        });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const errors = [];

        // Validation
        if (!currentPassword) {
            errors.push('Current password is required');
        }

        if (!newPassword) {
            errors.push('New password is required');
        } else {
            if (newPassword.length < 8) {
                errors.push('New password must be at least 8 characters long');
            }
            if (!/(?=.*[a-z])/.test(newPassword)) {
                errors.push('New password must contain at least one lowercase letter');
            }
            if (!/(?=.*[A-Z])/.test(newPassword)) {
                errors.push('New password must contain at least one uppercase letter');
            }
            if (!/(?=.*\d)/.test(newPassword)) {
                errors.push('New password must contain at least one number');
            }
            if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
                errors.push('New password must contain at least one special character (@$!%*?&)');
            }
        }

        if (!confirmNewPassword) {
            errors.push('Please confirm your new password');
        } else if (newPassword !== confirmNewPassword) {
            errors.push('New passwords do not match');
        }

        if (currentPassword === newPassword) {
            errors.push('New password must be different from current password');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User account no longer exists'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                error: 'Password change failed',
                details: ['Current password is incorrect']
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to change password. Please try again later.'
        });
    }
});

// @route   POST /api/auth/upload-profile-image
// @desc    Upload profile image
// @access  Private
router.post('/upload-profile-image', auth, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please select an image file to upload'
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User account no longer exists'
            });
        }

        // Store the file path as URL
        const fileUrl = `/uploads/${req.file.filename}`;
        user.profileImage = fileUrl;
        await user.save();

        // Get the full URL for the response
        const protocol = req.protocol;
        const host = req.get('host');
        const fullUrl = `${protocol}://${host}${fileUrl}`;

        res.json({
            message: 'Profile image uploaded successfully',
            profileImage: fullUrl,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                profileImage: fullUrl
            }
        });
    } catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message || 'Unable to upload image. Please try again later.'
        });
    }
});

// @route   DELETE /api/auth/profile-image
// @desc    Delete profile image
// @access  Private
router.delete('/profile-image', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User account no longer exists'
            });
        }

        // If user has a profile image, delete the file
        if (user.profileImage) {
            const fs = require('fs');
            const path = require('path');

            // Extract filename from the stored path (e.g., "/uploads/profile-123.jpg" -> "profile-123.jpg")
            const filename = user.profileImage.split('/').pop();
            const filePath = path.join(__dirname, '../uploads', filename);

            // Delete the file if it exists
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('Deleted profile image file:', filePath);
            }
        }

        // Clear the profileImage from database
        user.profileImage = null;
        await user.save();

        res.json({
            message: 'Profile image deleted successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                profileImage: null
            }
        });
    } catch (error) {
        console.error('Delete profile image error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message || 'Unable to delete image. Please try again later.'
        });
    }
});

module.exports = router;