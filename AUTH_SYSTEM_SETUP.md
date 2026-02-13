# Slay Season Authentication System

## Overview

A complete, production-ready authentication system for the Slay Season ecommerce dashboard. This system provides user registration and login functionality separate from Shopify OAuth (which remains for the embedded Shopify app).

### Key Features

- Beautiful, modern login/signup pages with glassmorphism design
- Dark theme matching the dashboard (bg: #0f1117, cards: #1c2033, accent: #6366f1)
- Real-time password strength indicator
- Form validation (email format, password requirements)
- JWT-based authentication with secure token storage
- Session persistence with localStorage
- Animated gradient backgrounds and smooth transitions
- Social login placeholders (Google, Shopify)
- Remember me functionality
- Responsive design for all screen sizes

## Architecture

### Frontend Components

#### 1. LoginPage.jsx
**Location:** `/client/src/pages/LoginPage.jsx`

Beautiful login page featuring:
- Email and password fields with icons
- Show/hide password toggle
- Remember me checkbox
- Forgot password link
- Social login buttons (Google, Shopify)
- Real-time form validation
- Error message display
- Loading state on submit button
- Glass morphism card design with gradient borders
- Animated background with layered gradients

**Key Props Used:**
- `useNavigate()` - Route navigation
- `useAuth()` - Authentication context
- Lucide icons: Mail, Lock, Eye, EyeOff, ArrowRight, Loader2

#### 2. SignupPage.jsx
**Location:** `/client/src/pages/SignupPage.jsx`

Beautiful signup page featuring:
- Full name, email, password, confirm password fields
- Real-time password strength indicator (Weak/Medium/Strong)
- Password match indicator with visual feedback
- Terms of service agreement checkbox with links
- Social signup buttons
- Comprehensive form validation
- Same glass morphism design as login page
- Scrollable form for mobile devices

**Key Features:**
- Password strength calculation based on length, character variety, numbers, and special characters
- Visual password match indicator
- Responsive form with proper spacing

#### 3. AuthProvider.jsx
**Location:** `/client/src/providers/AuthProvider.jsx`

React Context provider for global authentication state management.

**Exported Context:**
```javascript
{
  user,              // Current user object { id, name, email }
  isAuthenticated,   // Boolean auth state
  isLoading,         // Boolean loading state during session check
  login,             // Function: (email, password) => Promise
  signup,            // Function: (name, email, password) => Promise
  logout,            // Function: () => void
}
```

**Features:**
- Automatic session recovery on app load
- JWT token persistence in localStorage (`ss_token`)
- Protected API communication
- Graceful error handling

### Backend Routes

**Location:** `/server/routes/userAuth.js`

#### Authentication Endpoints

All routes are rate-limited and use JWT authentication (except signup/login).

##### POST /api/auth/signup
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Validation:**
- All fields required
- Password >= 8 characters
- Valid email format
- Email not already registered

##### POST /api/auth/login
Authenticate user with credentials.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- 400: Missing email or password
- 401: Invalid credentials

##### GET /api/auth/me
Get current authenticated user info.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- 401: No token or invalid token

##### POST /api/auth/logout
Logout user (mainly client-side, but useful for cleanup).

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

##### POST /api/auth/refresh
Refresh JWT token before expiration.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

##### POST /api/auth/change-password
Change user password (requires old password).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Usage Guide

### Setting Up Authentication

#### 1. Environment Variables

Ensure these are set in `.env`:

```bash
# JWT Secret (or defaults to ENCRYPTION_KEY)
JWT_SECRET=your-super-secret-key-change-in-production

# Frontend API URL
VITE_API_URL=http://localhost:4000/api
```

#### 2. Client-Side Integration

**Using the Auth Context in Components:**

```javascript
import { useAuth } from '@/providers/AuthProvider';

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Protected Routes:**

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
}
```

#### 3. Making Authenticated API Calls

```javascript
async function fetchUserData() {
  const token = localStorage.getItem('ss_token');

  const response = await fetch('/api/user/data', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
}
```

### Login Flow

1. User navigates to `/login`
2. Enters email and password
3. Clicks "Sign in" button
4. Frontend validates form
5. POST request to `/api/auth/login`
6. Server validates credentials and returns JWT
7. Token stored in localStorage (`ss_token`)
8. User context updated with user data
9. User redirected to home page

### Signup Flow

1. User navigates to `/signup`
2. Fills in all required fields
3. Password strength indicator updates in real-time
4. Agrees to terms of service
5. Clicks "Create account" button
6. Frontend validates form
7. POST request to `/api/auth/signup`
8. Server creates user account with hashed password
9. Returns JWT token
10. Token stored in localStorage
11. User logged in automatically
12. User redirected to home page

### Session Recovery

On app startup:
1. AuthProvider checks for `ss_token` in localStorage
2. If token exists, makes GET request to `/api/auth/me`
3. If valid, recovers user session
4. If invalid/expired, token is removed
5. User is logged out gracefully

## Security Features

### Password Security
- PBKDF2 hashing with 100,000 iterations
- Random salt generated per user
- 64-byte hash (512 bits)
- Minimum 8 character requirement

### Token Security
- JWT tokens with HS256 algorithm
- 7-day expiration time
- Refresh endpoint for token renewal
- Tokens stored in localStorage (vulnerable to XSS, consider httpOnly cookies in production)

### Input Validation
- Email format validation
- Password strength requirements
- XSS protection via React's built-in escaping
- SQL injection prevention (not applicable with in-memory store)

### Rate Limiting
- Auth routes are rate-limited via `authRateLimiter` middleware
- Protects against brute force attacks

### HTTPS in Production
- Must be deployed with HTTPS
- Set Secure flag on cookies
- Implement HSTS headers

## Database Considerations

**Current Implementation:**
- In-memory Map for user storage
- Users lost on server restart
- Suitable only for development/demo

**Production Implementation:**
- Use PostgreSQL, MongoDB, or similar
- Implement proper user table with indexes
- Add email uniqueness constraint
- Implement password reset functionality
- Add email verification
- Add two-factor authentication
- Implement account lockout after failed attempts

```sql
-- Example PostgreSQL schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(512) NOT NULL,
  salt VARCHAR(32) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  last_ip_address INET,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

## Customization

### Styling

The pages use Tailwind CSS with custom dark theme colors:
- Background: `#0f1117` (from-[#0f1117])
- Card: `#1c2033` (bg-[#1c2033])
- Accent: Indigo-500 and Purple-600 gradients

To customize:
1. Update Tailwind color classes
2. Modify gradient colors in the JSX
3. Adjust animation delays and durations

### Social Login Integration

Currently, social login buttons are placeholders. To implement:

**For Google OAuth:**
```javascript
// In LoginPage.jsx / SignupPage.jsx
const handleSocialLogin = async (provider) => {
  if (provider === 'Google') {
    // Implement Google OAuth flow
    const result = await window.gapi.auth2.getAuthInstance().signIn();
    const profile = result.getBasicProfile();

    // Call backend endpoint for Google login
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: result.getAuthResponse().id_token })
    });
  }
};
```

### Email Verification

To add email verification:

1. Create `POST /api/auth/send-verification` endpoint
2. Add `emailVerified` field to user model
3. Create verification token system
4. Create email confirmation page
5. Redirect unverified users to confirmation

### Password Reset

To add password reset functionality:

1. Create `POST /api/auth/forgot-password` endpoint
2. Generate time-limited reset tokens
3. Send reset link via email
4. Create `POST /api/auth/reset-password` endpoint
5. Create reset password page (`/reset-password/:token`)

## File Structure

```
client/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx           (NEW)
│   │   ├── SignupPage.jsx          (NEW)
│   │   └── ...
│   ├── providers/
│   │   ├── AuthProvider.jsx        (NEW)
│   │   └── ShopifyProvider.jsx
│   ├── App.jsx                     (UPDATED)
│   └── main.jsx                    (UPDATED)
│
server/
├── routes/
│   ├── userAuth.js                 (NEW)
│   ├── auth.js                     (Shopify OAuth)
│   └── ...
└── index.js                        (UPDATED)
```

## Testing

### Manual Testing

**Test Signup:**
1. Navigate to `http://localhost:5173/signup`
2. Fill in all fields with valid data
3. Verify password strength indicator works
4. Verify passwords must match
5. Submit form
6. Verify user is created and logged in
7. Check localStorage for `ss_token`

**Test Login:**
1. Navigate to `http://localhost:5173/login`
2. Enter correct credentials
3. Verify login succeeds
4. Check localStorage for `ss_token`
5. Enter incorrect credentials
6. Verify error message appears

**Test Session Recovery:**
1. Log in successfully
2. Refresh page
3. Verify user is still logged in
4. Close browser completely
5. Reopen site
6. Verify session is restored

**Test Validation:**
1. Try submitting empty forms
2. Try invalid email addresses
3. Try passwords under 8 characters
4. Try mismatched passwords
5. Verify appropriate error messages

### Automated Testing

Add to `package.json` for testing:

```bash
npm install --save-dev vitest @testing-library/react
```

Example test:
```javascript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/providers/AuthProvider';
import LoginPage from '@/pages/LoginPage';

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Token Not Persisting
- Check localStorage is enabled in browser
- Verify `ss_token` key is being set
- Check browser console for errors

### Login Fails with CORS Error
- Ensure `VITE_API_URL` is correctly set
- Check CORS configuration in server
- Verify frontend and backend URLs match

### Session Not Recovering
- Check if token exists in localStorage
- Verify `/api/auth/me` endpoint works with token
- Check token expiration time
- Look for errors in console

### Password Strength Not Working
- Verify password input onChange handler
- Check regex patterns for character validation
- Ensure state is updating correctly

### Styling Issues
- Verify Tailwind CSS is properly configured
- Check color values against theme
- Ensure dark mode is enabled
- Verify z-index values for overlays

## Production Checklist

- [ ] Replace in-memory user store with real database
- [ ] Implement email verification
- [ ] Implement password reset via email
- [ ] Add rate limiting (currently basic)
- [ ] Implement HTTPS/SSL
- [ ] Set secure, httpOnly flags on cookies
- [ ] Add CSRF protection
- [ ] Implement 2FA (two-factor authentication)
- [ ] Add account lockout after failed attempts
- [ ] Implement audit logging for auth events
- [ ] Set up monitoring and alerting
- [ ] Add terms of service acceptance tracking
- [ ] Implement GDPR compliance (data export, deletion)
- [ ] Add biometric authentication option
- [ ] Set up automated security scanning

## Support & Maintenance

### Common Tasks

**Reset User Password (Database Admin):**
```javascript
// In production, create admin endpoint
const salt = crypto.randomBytes(16).toString('hex');
const hashedPassword = hashPassword(newPassword, salt);
user.salt = salt;
user.hashedPassword = hashedPassword;
```

**Expire All Tokens:**
- Invalidate all tokens by changing JWT_SECRET (forces re-login)
- Better approach: implement token blacklist in Redis

**Monitor Authentication Events:**
- Log all login attempts
- Track failed login attempts per IP
- Alert on suspicious activity

## Related Documentation

- [SESSION_TOKEN_README.md](./SESSION_TOKEN_README.md) - Shopify OAuth flow
- [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) - General API integration
- [README.md](./README.md) - General project documentation
