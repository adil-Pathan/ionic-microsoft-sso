# Backend API Implementation for Microsoft SSO

## Overview

This guide provides Node.js/Express backend implementation for handling token exchange and validation.

## Prerequisites

- Node.js 16+
- npm or yarn
- Azure Entra ID app registration with client secret

## Setup

### Step 1: Install Dependencies

```bash
npm init -y
npm install express cors axios dotenv body-parser
npm install --save-dev nodemon
```

### Step 2: Create Environment File

Create `.env`:

```env
PORT=3000
NODE_ENV=development

AZURE_CLIENT_ID=YOUR_CLIENT_ID
AZURE_CLIENT_SECRET=YOUR_CLIENT_SECRET
AZURE_TENANT_ID=YOUR_TENANT_ID
AZURE_AUTHORITY=https://login.microsoftonline.com/YOUR_TENANT_ID
AZURE_REDIRECT_URI=msauth://YOUR_APP_PACKAGE/YOUR_HASH

JWT_SECRET=your_jwt_secret_key_here
```

## Implementation

### Basic Express Server

Create `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * Exchange auth code for access token
 * POST /api/auth/token
 */
app.post('/api/auth/token', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const tokenEndpoint = `${process.env.AZURE_AUTHORITY}/oauth2/v2.0/token`;

    const response = await axios.post(tokenEndpoint, null, {
      params: {
        client_id: process.env.AZURE_CLIENT_ID,
        client_secret: process.env.AZURE_CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri || process.env.AZURE_REDIRECT_URI,
        grant_type: 'authorization_code',
        scope: 'User.Read offline_access'
      }
    });

    res.json({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type
    });
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const tokenEndpoint = `${process.env.AZURE_AUTHORITY}/oauth2/v2.0/token`;

    const response = await axios.post(tokenEndpoint, null, {
      params: {
        client_id: process.env.AZURE_CLIENT_ID,
        client_secret: process.env.AZURE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'User.Read offline_access'
      }
    });

    res.json({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type
    });
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Get user profile (requires valid access token)
 * GET /api/user/profile
 */
app.get('/api/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token is required' });
    }

    const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      id: response.data.id,
      displayName: response.data.displayName,
      mail: response.data.mail,
      jobTitle: response.data.jobTitle,
      mobilePhone: response.data.mobilePhone
    });
  } catch (error) {
    console.error('Profile fetch error:', error.response?.data || error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Advanced Implementation with Validation

Create `auth.middleware.js`:

```javascript
const axios = require('axios');
const jwt = require('jsonwebtoken');

/**
 * Validate JWT token
 */
const validateToken = async (token) => {
  try {
    // Verify with Microsoft keys
    const response = await axios.get(
      `${process.env.AZURE_AUTHORITY}/discovery/v2.0/keys`
    );
    // Implementation details for JWT verification
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Auth middleware
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const isValid = await validateToken(token);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { authMiddleware, validateToken };
```

### Update package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## Deployment

### Docker Setup

Create `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t ionic-sso-backend .
docker run -p 3000:3000 --env-file .env ionic-sso-backend
```

### Heroku Deployment

```bash
heroku create your-app-name
heroku config:set AZURE_CLIENT_ID=YOUR_CLIENT_ID
heroku config:set AZURE_CLIENT_SECRET=YOUR_CLIENT_SECRET
heroku config:set AZURE_TENANT_ID=YOUR_TENANT_ID
heroku push
```

## Testing

### Test Token Exchange

```bash
curl -X POST http://localhost:3000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"code": "YOUR_AUTH_CODE"}'
```

### Test Profile Endpoint

```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Security Considerations

1. **Never expose client secret** in frontend code
2. **Use HTTPS** for all endpoints in production
3. **Implement rate limiting** to prevent abuse
4. **Validate all inputs** on the backend
5. **Store tokens securely** on client-side (use secure storage)
6. **Implement CORS** properly for allowed origins
7. **Add request logging** for audit trails
8. **Keep dependencies updated** regularly