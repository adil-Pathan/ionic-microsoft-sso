# Ionic 7 Microsoft SSO Integration

Complete implementation of Microsoft Azure Entra ID Single Sign-On (SSO) for Ionic 7 hybrid mobile applications.

## 🎯 Features

- ✅ Microsoft/Azure Entra ID authentication
- ✅ Hybrid mobile app support (Android & iOS)
- ✅ Secure token management
- ✅ Automatic token refresh
- ✅ HTTP interceptor for token attachment
- ✅ Auth guard for protected routes
- ✅ User profile retrieval from Microsoft Graph
- ✅ Deep linking support

## 📋 Prerequisites

- Node.js 16+ and npm
- Ionic 7 CLI
- Angular 16+
- iOS development tools (for iOS builds)
- Android SDK (for Android builds)
- Azure Entra ID tenant access

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/adil-Pathan/ionic-microsoft-sso.git
cd ionic-microsoft-sso
npm install
```

### 2. Configure Azure Entra ID

See [IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) for detailed Azure setup.

### 3. Update Configuration

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  clientId: 'YOUR_CLIENT_ID',
  tenantId: 'YOUR_TENANT_ID',
  redirectUri: 'msauth://YOUR_APP_PACKAGE_NAME/YOUR_SIGNATURE_HASH',
  authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
  msGraph: 'https://graph.microsoft.com/v1.0'
};
```

### 4. Setup Backend API

See [BACKEND_API.md](docs/BACKEND_API.md) for Node.js/Express implementation.

### 5. Platform-Specific Setup

- **Android**: See [ANDROID_SETUP.md](docs/ANDROID_SETUP.md)
- **iOS**: See [iOS_SETUP.md](docs/iOS_SETUP.md)

### 6. Build and Run

```bash
# Web development
ionic serve

# Android
ionic build
npx cap sync android
npx cap open android

# iOS
ionic build
npx cap sync ios
npx cap open ios
```

## 📁 Project Structure

```
src/
├── app/
│   ├── services/
│   │   └── auth.service.ts          # Main authentication service
│   ├── interceptors/
│   │   └── auth.interceptor.ts      # HTTP token interceptor
│   ├── guards/
│   │   └── auth.guard.ts            # Route protection guard
│   ├── pages/
│   │   ├── login/
│   │   │   ├── login.page.ts
│   │   │   ├── login.page.html
│   │   │   └── login.page.scss
│   │   └── home/
│   │       ├── home.page.ts
│   │       └── home.page.html
│   ├── app-routing.module.ts
│   └── app.module.ts
├── environments/
│   ├── environment.ts               # Configuration
│   └── environment.prod.ts
docs/
├── IMPLEMENTATION_GUIDE.md          # Complete setup guide
├── ANDROID_SETUP.md                 # Android configuration
├── iOS_SETUP.md                     # iOS configuration
├── BACKEND_API.md                   # Backend implementation
└── TROUBLESHOOTING.md               # Common issues
```

## 🔐 Key Components

### AuthService

Handles all authentication logic:

```typescript
login(): void
logout(): Observable<void>
refreshToken(): Observable<AuthToken>
isAuthenticated(): Observable<boolean>
getAccessToken(): string | null
getUserProfile(): UserProfile | null
```

### AuthInterceptor

Automatically attaches access token to all HTTP requests and handles token refresh on 401 errors.

### AuthGuard

Protects routes requiring authentication. Redirects to login if not authenticated.

## 🔑 Environment Variables

Create `.env` in backend:

```env
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret
AZURE_TENANT_ID=your_tenant_id
AZURE_AUTHORITY=https://login.microsoftonline.com/your_tenant_id
```

## 📱 Supported Platforms

- ✅ Android 7+
- ✅ iOS 14+
- ✅ Web (development only)

## 🔄 Authentication Flow

```
1. User clicks "Sign in with Microsoft"
2. App opens Microsoft login in browser
3. User enters credentials
4. Microsoft redirects to app with auth code
5. App exchanges code for access token (via backend)
6. App fetches user profile from Microsoft Graph
7. User is authenticated and logged in
```

## 🛡️ Security Features

- Secure token storage with encryption
- Automatic token refresh before expiration
- Backend token validation
- CORS protection
- Secure HTTP-only cookies (for web)
- Logout clears all sensitive data

## 📚 API Endpoints

Backend should implement:

- `POST /api/auth/token` - Exchange auth code for token
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/user/profile` - Get user profile

See [BACKEND_API.md](docs/BACKEND_API.md) for implementation details.

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues and solutions.

Common issues:
- Redirect URI mismatch
- Token expiration
- CORS errors
- Deep linking issues
- localStorage availability

## 📖 Documentation

- [Azure Entra ID Setup](docs/IMPLEMENTATION_GUIDE.md)
- [Android Configuration](docs/ANDROID_SETUP.md)
- [iOS Configuration](docs/iOS_SETUP.md)
- [Backend API](docs/BACKEND_API.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

## 📄 License

MIT License - feel free to use this in your projects

## 💡 Tips

1. Always test on physical devices, not just emulators
2. Keep tokens secure - never log them to console in production
3. Implement proper error handling and user feedback
4. Use HTTPS for all API communication
5. Regularly update dependencies
6. Test the logout flow thoroughly

## 🔗 Resources

- [Azure Entra ID Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- [Ionic Documentation](https://ionicframework.com/docs)
- [Angular Documentation](https://angular.io/docs)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)

## 📞 Support

For issues and questions:
1. Check [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
2. Review Azure Activity Logs
3. Check browser console for errors
4. Open an issue on GitHub

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-08  
**Maintainer**: adil-Pathan