# Troubleshooting Guide

## Common Issues and Solutions

### 1. Redirect URI Mismatch Error

**Error**: `AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application`

**Causes**:
- Redirect URI in Azure doesn't match the one in your app
- Signature hash is incorrect (Android)
- Bundle ID is incorrect (iOS)
- Case sensitivity issues

**Solutions**:
1. **Android**: Re-generate signature hash
   ```bash
   keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -list -v
   ```
2. **iOS**: Verify Bundle ID in Xcode matches Azure configuration
3. Double-check Azure configuration matches exactly (including case)
4. Clear browser cache and restart the app

### 2. Deep Linking Not Working

**Problem**: App doesn't receive auth code callback

**Solutions**:
- **Android**: 
  - Verify AndroidManifest.xml has correct intent-filter
  - Test on physical device (emulator deep linking can fail)
  - Check app package name matches configuration
  - Reinstall app after manifest changes

- **iOS**:
  - Verify Info.plist has correct CFBundleURLSchemes
  - Ensure app is installed (try removing and reinstalling)
  - Test on physical device if possible
  - Check bundle ID matches provisioning profile

### 3. Token Expiration Issues

**Problem**: User gets logged out or receives 401 errors

**Solutions**:
- Verify token refresh logic is implemented
- Check that refresh token is being stored and used
- Ensure backend token endpoint is working
- Monitor token expiration time in localStorage

**Debug**:
```typescript
console.log('Token expiry:', new Date(localStorage.getItem('token_expiry')));
```

### 4. CORS Errors

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions**:
- Backend must allow requests from your app origin
- Add proper CORS headers
- Verify backend is running and accessible

**Backend fix** (Express):
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'YOUR_APP_URL',
  credentials: true
}));
```

### 5. localStorage Not Available

**Problem**: App crashes or doesn't persist tokens

**Solutions**:
- localStorage might be disabled in WebView
- Consider using Ionic Storage plugin for better support
- Use sessionStorage as fallback

**Implementation**:
```typescript
import { Storage } from '@ionic/storage-angular';

constructor(private storage: Storage) {
  this.storage.create();
}

// Store token
await this.storage.set('auth_token', JSON.stringify(token));

// Retrieve token
const token = await this.storage.get('auth_token');
```

### 6. Invalid Scope Error

**Error**: `AADSTS65001: User or admin has not consented to use the application`

**Solutions**:
1. Go to Azure Portal
2. Navigate to your app → API permissions
3. Click "Grant admin consent"
4. Ensure all required permissions are granted
5. Request minimal necessary scopes

**Recommended scopes**:
```typescript
scopes: ['User.Read', 'profile', 'openid', 'email']
```

### 7. App Crashes on Login

**Problem**: App crashes when trying to login

**Solutions**:
- Check browser console for JavaScript errors
- Verify @capacitor/app and @capacitor/browser are installed
- Ensure AuthService is properly injected
- Check logcat (Android) or Console (iOS) for native errors

**Android Logcat**:
```bash
adb logcat | grep ERROR
```

### 8. Network Timeout Errors

**Problem**: Requests timeout or fail

**Solutions**:
- Check internet connection
- Verify backend server is running
- Check firewall settings
- Use longer timeout for slow connections

**Add timeout to HttpClient**:
```typescript
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

this.http.post(...).pipe(
  timeout(10000) // 10 seconds
)
```

### 9. User Profile Not Loading

**Problem**: User profile doesn't display after login

**Solutions**:
- Verify User.Read permission is granted
- Check that access token is valid
- Ensure user profile is being fetched after token retrieval
- Check network requests in browser DevTools

### 10. App Won't Build

**Android Issues**:
```bash
# Clear gradle cache
./gradlew clean

# Sync again
ionicnpx cap sync android
```

**iOS Issues**:
```bash
# Clear CocoaPods
cd ios
pod repo update
pod install
cd ..

# Sync again
npx cap sync ios
```

## Debug Mode

### Enable Debug Logging

```typescript
// In auth.service.ts
private enableDebugLogging = true;

private log(message: string, data?: any) {
  if (this.enableDebugLogging) {
    console.log(`[AuthService] ${message}`, data);
  }
}
```

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for requests to:
   - login.microsoftonline.com
   - graph.microsoft.com
   - Your backend API
4. Check response status and headers

### Monitor Token Storage

```typescript
// In browser console
localStorage.getItem('auth_token')
localStorage.getItem('token_expiry')
localStorage.getItem('user_profile')
```

## Getting Help

1. Check browser console for errors
2. Enable debug logging in AuthService
3. Verify Azure configuration
4. Test on physical device
5. Review GitHub issues
6. Contact support with:
   - Error message
   - Browser/device info
   - Steps to reproduce
   - Screenshots/logs

## Performance Tips

1. **Lazy load modules** for faster initial load
2. **Cache user profile** to reduce API calls
3. **Preload authentication** on app startup
4. **Use production builds** for testing
5. **Monitor network requests** with DevTools

## Security Best Practices

- Never log sensitive data to console
- Use HTTPS for all communications
- Keep secrets on backend only
- Validate all inputs on backend
- Use secure token storage
- Implement proper logout
- Test on real devices
- Keep dependencies updated