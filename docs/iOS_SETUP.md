# iOS Setup for Microsoft SSO

## Prerequisites
- Xcode 13+
- iOS 14+ deployment target
- Apple Developer Account
- CocoaPods

## Step 1: Update Bundle ID

1. Open `ios/App/App.xcodeproj` in Xcode
2. Select the **App** target
3. Go to **General** tab
4. Update **Bundle Identifier** (e.g., `com.example.ionicsso`)
5. Update **Team ID** with your developer team

## Step 2: Configure Info.plist

Add the following to `ios/App/App/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>msauth.YOUR_BUNDLE_ID</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>msauth.YOUR_BUNDLE_ID</string>
    </array>
  </dict>
</array>
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>msauth</string>
  <string>msauthv2</string>
</array>
```

Replace `YOUR_BUNDLE_ID` with your actual bundle ID (e.g., `com.example.ionicsso`).

## Step 3: Update Azure Configuration

1. Go to Azure Portal → App registrations → Your app
2. Go to **Authentication** tab
3. Add/update redirect URI:
   - Platform: iOS/macOS
   - URI: `msauth.YOUR_BUNDLE_ID://auth`

## Step 4: Update Environment Configuration

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  clientId: 'YOUR_CLIENT_ID',
  tenantId: 'YOUR_TENANT_ID',
  redirectUri: 'msauth.com.example.ionicsso://auth',
  authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
  msGraph: 'https://graph.microsoft.com/v1.0'
};
```

## Step 5: Build for iOS

```bash
ionic build
npx cap sync ios
npx cap open ios
```

In Xcode:
1. Select the **App** scheme and **iPhone** simulator (or physical device)
2. Click **Product** → **Run** (or press Cmd+R)
3. The app will build and launch

## Step 6: Configure Signing

For physical device testing:

1. Connect your iPhone to your Mac
2. In Xcode, go to **Signing & Capabilities**
3. Enable automatic signing or manually select your development team
4. Update the Bundle Identifier to match your provisioning profile
5. Select your device and run the app

## Step 7: Test Deep Linking

To test deep linking, you can use:

```bash
open "msauth.com.example.ionicsso://auth?code=AUTH_CODE"
```

Or simulate in Xcode:
1. Go to **Product** → **Scheme** → **Edit Scheme**
2. Go to **Run** → **Arguments**
3. Add URL under "Launch Arguments"

## Troubleshooting

### Deep linking not working
- Verify Info.plist has correct bundle ID and URL scheme
- Ensure CFBundleURLSchemes includes your scheme
- Reinstall app on device

### Code signing errors
- Verify Apple Developer Team is set correctly
- Check provisioning profiles in Xcode
- Update signing certificate if expired

### Redirect URI mismatch
- Ensure Azure redirect URI exactly matches Info.plist scheme
- Format must be: `msauth.YOUR_BUNDLE_ID://auth`
- Case-sensitive!

### Build failures
- Run `pod update` in ios directory
- Clean build folder: Cmd+Shift+K
- Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`
- Rebuild project