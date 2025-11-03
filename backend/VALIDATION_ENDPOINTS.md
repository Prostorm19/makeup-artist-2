# Email and Password Validation Test Guide

## New API Endpoints Added

### 1. Check Email Availability
**Endpoint:** `POST /api/auth/check-email`

**Purpose:** Check if an email is already registered before allowing signup

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Email Available):**
```json
{
  "available": true,
  "message": "Email is available for registration"
}
```

**Response (Email Already Registered):**
```json
{
  "available": false,
  "message": "This email address is already registered. Please use a different email or try logging in."
}
```

### 2. Password Strength Validation
**Endpoint:** `POST /api/auth/validate-password`

**Purpose:** Real-time password strength validation as user types

**Request Body:**
```json
{
  "password": "MyPassword123!"
}
```

**Response (Strong Password):**
```json
{
  "isValid": true,
  "strength": "Strong",
  "passed": [
    "At least 8 characters",
    "Contains lowercase letter",
    "Contains uppercase letter",
    "Contains number",
    "Contains special character"
  ],
  "score": 5
}
```

**Response (Weak Password):**
```json
{
  "isValid": false,
  "strength": "Weak",
  "passed": [
    "At least 8 characters"
  ],
  "errors": [
    "Password must contain at least one lowercase letter",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one number",
    "Password must contain at least one special character (@$!%*?&)"
  ],
  "score": 1
}
```

## Enhanced Sign Up Validation

The `/api/auth/signup` endpoint now provides more detailed error messages for duplicate emails:

**Enhanced Error Response:**
```json
{
  "error": "Registration failed",
  "details": [
    "An account with email \"john@example.com\" already exists. Please use a different email address or try logging in."
  ]
}
```

## Password Validation Rules

### Current Requirements:
- ✅ Minimum 8 characters
- ✅ At least one lowercase letter (a-z)
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one number (0-9)
- ✅ At least one special character (@$!%*?&)

### Password Strength Scoring:
- **Strong (5/5):** Meets all requirements
- **Medium (3-4/5):** Meets most requirements
- **Weak (1-2/5):** Meets few requirements

## Frontend Integration Examples

### Email Validation on Blur:
```javascript
const checkEmailAvailability = async (email) => {
  try {
    const response = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    
    if (!data.available) {
      showEmailError(data.message);
    } else {
      clearEmailError();
    }
  } catch (error) {
    console.error('Email check failed:', error);
  }
};
```

### Real-time Password Validation:
```javascript
const validatePasswordStrength = async (password) => {
  try {
    const response = await fetch('/api/auth/validate-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await response.json();
    
    updatePasswordStrengthUI(data);
  } catch (error) {
    console.error('Password validation failed:', error);
  }
};
```

## Testing the Endpoints

You can test these endpoints using tools like Postman or curl:

### Test Email Check:
```bash
curl -X POST http://localhost:3000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test Password Validation:
```bash
curl -X POST http://localhost:3000/api/auth/validate-password \
  -H "Content-Type: application/json" \
  -d '{"password": "TestPass123!"}'
```

These endpoints provide real-time feedback to users during the registration process, improving user experience and reducing form submission errors.