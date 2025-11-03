const validator = require('validator');

// Validation middleware for signup
const validateSignup = (req, res, next) => {
    const { name, email, password, confirmPassword, userType } = req.body;
    const errors = [];

    // Name validation
    if (!name || !name.trim()) {
        errors.push('Name is required');
    } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    } else if (name.trim().length > 50) {
        errors.push('Name cannot exceed 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
        errors.push('Name can only contain letters and spaces');
    }

    // Email validation
    if (!email || !email.trim()) {
        errors.push('Email is required');
    } else if (!validator.isEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else {
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push('Password must contain at least one special character (@$!%*?&)');
        }
    }

    // Confirm password validation (optional - only if confirmPassword is provided)
    if (confirmPassword !== undefined) {
        if (!confirmPassword) {
            errors.push('Please confirm your password');
        } else if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }
    }

    // User type validation
    if (!userType) {
        errors.push('User type is required');
    } else if (!['client', 'artist'].includes(userType)) {
        errors.push('User type must be either "client" or "artist"');
    }

    // If there are errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    // Sanitize inputs
    req.body.name = name.trim();
    req.body.email = email.toLowerCase().trim();

    next();
};

// Validation middleware for login
const validateLogin = (req, res, next) => {
    const { email, password, userType } = req.body;
    const errors = [];

    // Email validation
    if (!email || !email.trim()) {
        errors.push('Email is required');
    } else if (!validator.isEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Invalid password format');
    }

    // User type validation
    if (!userType) {
        errors.push('User type is required');
    } else if (!['client', 'artist'].includes(userType)) {
        errors.push('User type must be either "client" or "artist"');
    }

    // If there are errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    // Sanitize inputs
    req.body.email = email.toLowerCase().trim();

    next();
};

// Validation middleware for profile update
const validateProfileUpdate = (req, res, next) => {
    const { name, phone, profileImage } = req.body;
    const errors = [];

    // Name validation (if provided)
    if (name !== undefined) {
        if (!name || !name.trim()) {
            errors.push('Name cannot be empty');
        } else if (name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        } else if (name.trim().length > 50) {
            errors.push('Name cannot exceed 50 characters');
        } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
            errors.push('Name can only contain letters and spaces');
        }
    }

    // Phone validation (if provided)
    if (phone !== undefined && phone !== null && phone !== '') {
        if (!validator.isMobilePhone(phone)) {
            errors.push('Please provide a valid phone number');
        }
    }

    // Profile image validation (if provided)
    if (profileImage !== undefined && profileImage !== null && profileImage !== '') {
        if (!validator.isURL(profileImage)) {
            errors.push('Profile image must be a valid URL');
        }
    }

    // If there are errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    // Sanitize inputs
    if (name !== undefined) {
        req.body.name = name.trim();
    }

    next();
};

// Rate limiting helper for authentication attempts
const createRateLimitStore = () => {
    const attempts = new Map();

    return {
        increment: (key) => {
            const current = attempts.get(key) || { count: 0, resetTime: Date.now() + 15 * 60 * 1000 }; // 15 minutes

            if (Date.now() > current.resetTime) {
                current.count = 1;
                current.resetTime = Date.now() + 15 * 60 * 1000;
            } else {
                current.count++;
            }

            attempts.set(key, current);
            return current.count;
        },
        get: (key) => {
            const current = attempts.get(key);
            if (!current || Date.now() > current.resetTime) {
                return 0;
            }
            return current.count;
        },
        clear: (key) => {
            attempts.delete(key);
        }
    };
};

const rateLimitStore = createRateLimitStore();

// Rate limiting middleware for login attempts
const rateLimitLogin = (req, res, next) => {
    const key = `login_${req.ip}_${req.body.email}`;
    const attempts = rateLimitStore.get(key);

    if (attempts >= 5) {
        return res.status(429).json({
            error: 'Too many login attempts',
            message: 'Please try again in 15 minutes'
        });
    }

    // Store the key for potential increment after failed login
    req.rateLimitKey = key;
    next();
};

module.exports = {
    validateSignup,
    validateLogin,
    validateProfileUpdate,
    rateLimitLogin,
    rateLimitStore
};