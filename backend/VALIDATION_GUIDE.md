# Authentication Validation Documentation

## Overview
I've added comprehensive validation for the sign up/sign in functionality with the following enhancements:

## 🔒 Validation Features Added

### 1. **Sign Up Validation**
- **Name**: 2-50 characters, letters and spaces only
- **Email**: Valid email format, converted to lowercase
- **Password**: Minimum 8 characters with:
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
  - At least one special character (@$!%*?&)
- **Confirm Password**: Must match the password
- **User Type**: Must be either "client" or "artist"

### 2. **Sign In Validation**
- **Email**: Valid email format
- **Password**: Required field
- **User Type**: Must be either "client" or "artist"
- **Rate Limiting**: Maximum 5 failed attempts per IP/email combination (15-minute lockout)

### 3. **Profile Update Validation**
- **Name**: Same rules as sign up (optional)
- **Phone**: Valid mobile phone number (optional)
- **Profile Image**: Valid URL format (optional)

### 4. **Password Change Validation**
- **Current Password**: Required and must be correct
- **New Password**: Same strength requirements as sign up
- **Confirm New Password**: Must match new password
- **Different Password**: New password must be different from current

## 🛡️ Security Features

### 1. **Input Sanitization**
- Removes HTML tags and scripts
- Prevents XSS attacks
- Sanitizes all input fields

### 2. **Rate Limiting**
- Prevents brute force attacks
- 5 attempts per 15 minutes per IP/email
- Automatic reset after successful login

### 3. **Enhanced Error Messages**
- Detailed validation feedback
- Consistent error format
- User-friendly messages

## 📝 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "userType": "client",
    "profileImage": null
  }
}
```

### Error Response
```json
{
  "error": "Validation failed",
  "details": [
    "Password must contain at least one uppercase letter",
    "Passwords do not match"
  ]
}
```

## 🔧 New API Endpoints

### Change Password
```
PUT /api/auth/change-password
Headers: Authorization: Bearer <token>
Body: {
  "currentPassword": "current_password",
  "newPassword": "new_password",
  "confirmNewPassword": "new_password"
}
```

## 📂 Files Created/Modified

### New Files:
1. `middleware/validation.js` - Validation middleware
2. `middleware/sanitize.js` - Input sanitization
3. `utils/validation.js` - Validation utilities

### Modified Files:
1. `routes/auth.js` - Enhanced with validation
2. `models/User.js` - Stronger password requirements
3. `server.js` - Added sanitization middleware

## 🧪 Testing Examples

### Valid Sign Up Request
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "userType": "client"
}
```

### Invalid Sign Up Request (will show validation errors)
```json
{
  "name": "J",
  "email": "invalid-email",
  "password": "weak",
  "confirmPassword": "different",
  "userType": "invalid"
}
```

The validation system is now production-ready with comprehensive security measures and user-friendly error messages!