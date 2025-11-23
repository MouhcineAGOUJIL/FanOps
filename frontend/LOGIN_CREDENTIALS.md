# 🔐 Authentication Setup

## Current Status: Backend API Authentication

The app now uses **real backend authentication** via M2 (AWS) service.

### For Development/Testing:

If M2 is not yet deployed, you can temporarily use demo mode:

1. **Edit `src/services/authService.js`**
2. **Replace with demo credentials:**

```javascript
export const authService = {
  login: async (username, password) => {
    // Demo mode - hardcoded users
    if (username === 'admin' && password === 'admin123') {
      const mockToken = 'demo-admin-token';
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_role', 'admin');
      return { ok: true, user: { username: 'admin', role: 'admin', token: mockToken } };
    }
    if (username === 'fan' && password === 'fan123') {
      const mockToken = 'demo-fan-token';
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_role', 'fan');
      return { ok: true, user: { username: 'fan', role: 'fan', token: mockToken } };
    }
    return { ok: false, message: 'Invalid credentials' };
  },
  logout: () => {
    localStorage.clear();
  },
  getCurrentUser: () => ({ username: localStorage.getItem('user_role') || 'guest' }),
  isAuthenticated: () => !!localStorage.getItem('auth_token')
};
```

### Production Setup:

Once M2 (AWS Secure-Gates) is deployed:
- Update `VITE_API_URL` in `.env` to point to M2 auth endpoint
- Authentication will work through AWS Lambda + DynamoDB
- JWT tokens will be validated properly

---

**Demo Credentials (if using demo mode):**
- Admin: `admin` / `admin123`
- Fan: `fan` / `fan123`
