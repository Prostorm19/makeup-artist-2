const validator = require('validator');

// Common validation rules
const validationRules = {
    // Name validation
    name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
        messages: {
            required: 'Name is required',
            minLength: 'Name must be at least 2 characters long',
            maxLength: 'Name cannot exceed 50 characters',
            pattern: 'Name can only contain letters and spaces'
        }
    },

    // Email validation
    email: {
        required: true,
        isEmail: true,
        messages: {
            required: 'Email is required',
            isEmail: 'Please provide a valid email address'
        }
    },

    // Password validation
    password: {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        messages: {
            required: 'Password is required',
            minLength: 'Password must be at least 8 characters long',
            pattern: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'
        }
    },

    // User type validation
    userType: {
        required: true,
        enum: ['client', 'artist'],
        messages: {
            required: 'User type is required',
            enum: 'User type must be either "client" or "artist"'
        }
    },

    // Phone validation
    phone: {
        required: false,
        isMobilePhone: true,
        messages: {
            isMobilePhone: 'Please provide a valid phone number'
        }
    },

    // URL validation
    url: {
        required: false,
        isURL: true,
        messages: {
            isURL: 'Please provide a valid URL'
        }
    }
};

// Generic validator function
const validateField = (value, rules, fieldName) => {
    const errors = [];

    // Required check
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors.push(rules.messages.required || `${fieldName} is required`);
        return errors; // Return early if required field is missing
    }

    // Skip other validations if field is not required and empty
    if (!rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return errors;
    }

    // String validations
    if (typeof value === 'string') {
        const trimmedValue = value.trim();

        // Min length check
        if (rules.minLength && trimmedValue.length < rules.minLength) {
            errors.push(rules.messages.minLength || `${fieldName} must be at least ${rules.minLength} characters long`);
        }

        // Max length check
        if (rules.maxLength && trimmedValue.length > rules.maxLength) {
            errors.push(rules.messages.maxLength || `${fieldName} cannot exceed ${rules.maxLength} characters`);
        }

        // Pattern check
        if (rules.pattern && !rules.pattern.test(trimmedValue)) {
            errors.push(rules.messages.pattern || `${fieldName} format is invalid`);
        }

        // Email check
        if (rules.isEmail && !validator.isEmail(trimmedValue)) {
            errors.push(rules.messages.isEmail || `${fieldName} must be a valid email address`);
        }

        // Mobile phone check
        if (rules.isMobilePhone && !validator.isMobilePhone(trimmedValue)) {
            errors.push(rules.messages.isMobilePhone || `${fieldName} must be a valid phone number`);
        }

        // URL check
        if (rules.isURL && !validator.isURL(trimmedValue)) {
            errors.push(rules.messages.isURL || `${fieldName} must be a valid URL`);
        }
    }

    // Enum check
    if (rules.enum && !rules.enum.includes(value)) {
        errors.push(rules.messages.enum || `${fieldName} must be one of: ${rules.enum.join(', ')}`);
    }

    return errors;
};

// Validate multiple fields
const validateFields = (data, fieldRules) => {
    const allErrors = [];

    for (const [fieldName, rules] of Object.entries(fieldRules)) {
        const fieldErrors = validateField(data[fieldName], rules, fieldName);
        allErrors.push(...fieldErrors);
    }

    return allErrors;
};

// Pre-defined validation sets
const validationSets = {
    signup: {
        name: validationRules.name,
        email: validationRules.email,
        password: validationRules.password,
        userType: validationRules.userType
    },

    login: {
        email: validationRules.email,
        password: { ...validationRules.password, minLength: 1 }, // Less strict for login
        userType: validationRules.userType
    },

    profileUpdate: {
        name: { ...validationRules.name, required: false },
        phone: validationRules.phone,
        profileImage: validationRules.url
    },

    changePassword: {
        currentPassword: { required: true, messages: { required: 'Current password is required' } },
        newPassword: validationRules.password,
        confirmNewPassword: { required: true, messages: { required: 'Please confirm your new password' } }
    }
};

// Password confirmation validator
const validatePasswordConfirmation = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        return ['Passwords do not match'];
    }
    return [];
};

// Export validation utilities
module.exports = {
    validationRules,
    validateField,
    validateFields,
    validationSets,
    validatePasswordConfirmation
};