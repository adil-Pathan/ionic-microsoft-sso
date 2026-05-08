# Android Setup for Microsoft SSO

## Prerequisites
- Android SDK installed
- Android Studio
- Keytool (comes with Java)

## Step 1: Generate Signature Hash

Open terminal/command prompt and run:

```bash
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -list -v
```

On Windows, the keystore is located at:
```bash
keytool -exportcert -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore -list -v
```

When prompted for password, enter: `android`

**Copy the SHA-1 hash value** - you'll need this for Azure configuration.

## Step 2: Convert SHA-1 to Base64 URL-Encoded Format

You can use an online tool or Python:

```python
import base64
sha1_hash = "YOUR_SHA1_HASH"
base64_hash = base64.b64encode(bytes.fromhex(sha1_hash)).decode('utf-8')
print(base64_hash)
```

## Step 3: Update Azure Configuration

1. Go to Azure Portal → App registrations → Your app
2. Go to **Authentication** tab
3. Add/update redirect URI:
   - Platform: Mobile and desktop applications
   - URI: `msauth://com.ionic.microsoftsso/YOUR_BASE64_HASH`

## Step 4: Configure AndroidManifest.xml

Add the following to `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <!-- Existing application config -->
  
  <activity
    android:name=".MainActivity"
    android:exported="true">
    <intent-filter>
      <action android:name="android.intent.action.MAIN" />
      <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    
    <!-- Add this for deep linking -->
    <intent-filter>
      <action android:name="android.intent.action.VIEW" />
      <category android:name="android.intent.category.DEFAULT" />
      <category android:name="android.intent.category.BROWSABLE" />
      <data android:scheme="msauth" android:host="com.ionic.microsoftsso" android:path="/YOUR_BASE64_HASH" />
    </intent-filter>
  </activity>
</application>
```

## Step 5: Update Environment Configuration

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  clientId: 'YOUR_CLIENT_ID',
  tenantId: 'YOUR_TENANT_ID',
  redirectUri: 'msauth://com.ionic.microsoftsso/YOUR_BASE64_HASH',
  authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
  msGraph: 'https://graph.microsoft.com/v1.0'
};
```

## Step 6: Build for Android

```bash
ionic build
npx cap sync android
npx cap open android
```

In Android Studio:
1. Click **Build** → **Build Bundle(s) / APK(s)**
2. Follow the wizard to create a signed APK
3. Deploy to device or emulator

## Step 7: Test Deep Linking

```bash
adb shell am start -W -a android.intent.action.VIEW -d "msauth://com.ionic.microsoftsso/YOUR_BASE64_HASH?code=AUTH_CODE" com.ionic.microsoftsso
```

## Troubleshooting

### Deep linking not working
- Verify the signature hash matches Azure configuration
- Ensure AndroidManifest.xml has correct intent-filter
- Test on physical device (emulator deep linking can be unreliable)

### App crashes on login
- Check logcat for errors: `adb logcat | grep ERROR`
- Verify @capacitor/app and @capacitor/browser are installed
- Ensure deep linking setup is correct

### Redirect URI mismatch error in Azure
- Double-check the Base64 encoding of SHA-1 hash
- Ensure format is exactly: `msauth://PACKAGE_NAME/BASE64_HASH`
- Clear app cache and reinstall