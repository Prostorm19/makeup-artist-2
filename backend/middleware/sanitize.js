// Sanitization middleware to prevent XSS attacks
const sanitizeInputs = (req, res, next) => {
    // Function to recursively sanitize object properties
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            // Remove any HTML tags and dangerous characters
            return value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
                .replace(/<[^>]*>/g, '') // Remove all HTML tags
                .replace(/javascript:/gi, '') // Remove javascript: protocol
                .replace(/on\w+\s*=/gi, '') // Remove event handlers
                .trim();
        } else if (typeof value === 'object' && value !== null) {
            // Recursively sanitize object properties
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    value[key] = sanitizeValue(value[key]);
                }
            }
        }
        return value;
    };

    // Sanitize req.body
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
    }

    // Sanitize req.query
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeValue(req.query);
    }

    // Sanitize req.params
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeValue(req.params);
    }

    next();
};

module.exports = sanitizeInputs;