# Authentication System - Quick Start

## What Was Built

A complete authentication system with beautiful login/signup pages for the Slay Season dashboard.

### Features at a Glance

✓ Beautiful login page with email/password forms
✓ Signup page with password strength indicator
✓ JWT token-based authentication
✓ Session persistence (auto-login on refresh)
✓ Form validation with real-time feedback
✓ Glass morphism design with animated gradients
✓ Dark theme (indigo accents)
✓ Social login placeholders (Google, Shopify)
✓ Backend API routes with security

## Files Created

### Frontend

1. **`client/src/pages/LoginPage.jsx`** - Beautiful login form
2. **`client/src/pages/SignupPage.jsx`** - Registration form with password strength
3. **`client/src/providers/AuthProvider.jsx`** - React Context for auth state

### Backend

4. **`server/routes/userAuth.js`** - Auth API endpoints

### Updated

5. **`client/src/App.jsx`** - Added login/signup routes
6. **`client/src/main.jsx`** - Added AuthProvider wrapper
7. **`server/index.js`** - Added userAuth router

## How to Use

### 1. Access Login/Signup Pages

```
Login:  http://localhost:5173/login
Signup: http://localhost:5173/signup
```

### 2. Use Auth in Components

```javascript
import { useAuth } from '@/providers/AuthProvider';

export function MyComponent() {
  const { user, isAuthenticated, login, signup, logout } = useAuth();

  // Check if user is logged in
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  // Use user data
  return <div>Welcome, {user.name}!</div>;
}
```

### 3. Make Authenticated API Calls

```javascript
// Token is automatically stored in localStorage
const token = localStorage.getItem('ss_token');

const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## API Endpoints

All endpoints are at `http://localhost:4000/api/auth/`

### Public Endpoints (No Token Required)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/signup` | Register new user |
| POST | `/login` | Login user |

**Request Body:**
```json
// Signup
{ "name": "John", "email": "john@example.com", "password": "Pass123!" }

// Login
{ "email": "john@example.com", "password": "Pass123!" }
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "name": "John", "email": "john@example.com" }
}
```

### Protected Endpoints (Token Required)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/me` | Get current user |
| POST | `/logout` | Logout |
| POST | `/refresh` | Get new token |
| POST | `/change-password` | Change password |

**Header Required:**
```
Authorization: Bearer <token>
```

## Password Requirements

- Minimum 8 characters
- Should include uppercase and lowercase letters
- Should include numbers
- Should include special characters (recommended)

## Dark Theme Colors

The pages match your dashboard theme:

```
Background: #0f1117
Cards:      #1c2033
Accent:     #6366f1 (Indigo)
Secondary:  #a855f7 (Purple)
```

## Testing It Out

### 1. Test Signup

```bash
# Click "Sign up" link or navigate to /signup
# Fill in form with:
# - Name: John Doe
# - Email: john@example.com
# - Password: SecurePass123!
# - Confirm: SecurePass123!
# Click Create Account

# Check localStorage in DevTools -> Application -> Local Storage
# Should see "ss_token" key with JWT value
```

### 2. Test Login

```bash
# Navigate to /login
# Email: john@example.com
# Password: SecurePass123!
# Click Sign In

# You should be logged in and redirected home
# Token should be in localStorage
```

### 3. Test Session Recovery

```bash
# After logging in, refresh the page (F5)
# You should still be logged in (token was recovered)
# Check console - should see "Session check" response
```

### 4. Test Logout

```javascript
// In browser console
import { useAuth } from '@/providers/AuthProvider';
const { logout } = useAuth();
logout();
// localStorage should no longer have 'ss_token'
```

## Customization Examples

### Change Colors

In `LoginPage.jsx` or `SignupPage.jsx`:

```javascript
// Change gradient colors
<div className="bg-gradient-to-br from-[#0f1117] via-[#1c2033] to-[#0f1117]">

// To your colors (e.g., blue theme):
<div className="bg-gradient-to-br from-[#000033] via-[#001166] to-[#000033]">
```

### Change Button Text

```javascript
// In LoginPage.jsx line ~180
<button>Sign in</button>

// Change to:
<button>Login Now</button>
```

### Add Custom Validation

```javascript
// In SignupPage.jsx validateForm()
const validateForm = () => {
  setError('');

  // Add custom validation
  if (fullName.length < 3) {
    setError('Name must be at least 3 characters');
    return false;
  }

  // ... rest of validation
};
```

### Implement Social Login

```javascript
// In LoginPage.jsx handleSocialLogin()
const handleSocialLogin = async (provider) => {
  if (provider === 'Google') {
    // Implement Google OAuth
    try {
      const result = await window.gapi.auth2
        .getAuthInstance()
        .signIn();

      // Send to backend
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          idToken: result.getAuthResponse().id_token
        })
      });

      const data = await response.json();
      localStorage.setItem('ss_token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }
};
```

## Environment Variables

Ensure `.env` has:

```bash
# Frontend
VITE_API_URL=http://localhost:4000/api

# Backend
JWT_SECRET=your-secret-key-change-me
ENCRYPTION_KEY=your-encryption-key
```

## Common Issues & Fixes

### Issue: "Module not found: AuthProvider"
**Fix:** Ensure file is at `client/src/providers/AuthProvider.jsx`

### Issue: CORS error on login
**Fix:** Check `VITE_API_URL` matches backend URL

### Issue: Token not saving to localStorage
**Fix:** Check browser allows localStorage (not private/incognito mode)

### Issue: Login works but user data is undefined
**Fix:** Check `/api/auth/me` endpoint is working with token

### Issue: Pages show 404
**Fix:** Ensure routes are added to `App.jsx` (already done)

## Next Steps

1. **Database Integration:**
   - Replace in-memory Map with real database
   - Use PostgreSQL/MongoDB

2. **Email Verification:**
   - Add email verification flow
   - Create confirmation page

3. **Password Reset:**
   - Add forgot password page
   - Send reset email with token

4. **Social Login:**
   - Integrate Google OAuth
   - Integrate Shopify OAuth

5. **2FA (Two-Factor Authentication):**
   - Add TOTP support
   - Add SMS verification option

6. **Admin Features:**
   - User management dashboard
   - Reset user passwords
   - View login history

## File Locations Reference

```
ecommerce-dashboard/
├── client/src/
│   ├── pages/
│   │   ├── LoginPage.jsx          ← Login form
│   │   ├── SignupPage.jsx         ← Signup form
│   │   └── DashboardPage.jsx      (existing)
│   ├── providers/
│   │   ├── AuthProvider.jsx       ← Auth context
│   │   └── ShopifyProvider.jsx    (existing)
│   ├── App.jsx                    ← Routes config
│   └── main.jsx                   ← Provider setup
│
├── server/
│   ├── routes/
│   │   ├── userAuth.js            ← Auth API
│   │   └── auth.js                (Shopify OAuth)
│   └── index.js                   ← Route setup
│
└── AUTH_SYSTEM_SETUP.md           ← Full documentation
```

## Support

For detailed documentation, see: **AUTH_SYSTEM_SETUP.md**

Key sections:
- Architecture & Components
- API Endpoint Details
- Database Schema Examples
- Security Features
- Production Checklist
- Testing Guide
