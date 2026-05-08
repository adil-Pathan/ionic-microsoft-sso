# Microsoft SSO Implementation Guide for Ionic 7 Mobile App

## Overview
This guide provides step-by-step instructions to integrate Microsoft SSO (Azure Entra ID) into an Ionic 7 hybrid mobile application.

## Prerequisites
- Ionic 7 project setup
- Node.js and npm installed
- Azure Entra ID tenant access
- Android and/or iOS development environment

## 1. Azure Entra ID Configuration

### Step 1.1: Create App Registration in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Entra ID** → **App registrations** → **New registration**
3. Fill in the registration details:
   - **Name**: Your app name (e.g., "Ionic Microsoft SSO App")
   - **Supported account types**: Select appropriate option (usually "Accounts in any organizational directory")
4. Click **Register**

### Step 1.2: Configure Redirect URIs

1. Go to **Authentication** tab
2. Under **Platform configurations**, click **Add a platform**
3. Select **Mobile and desktop applications**
4. Add redirect URIs for your app:
   - **Android**: `msauth://YOUR_APP_PACKAGE_NAME/YOUR_SIGNATURE_HASH`
   - **iOS**: `msauth.YOUR_BUNDLE_ID://auth`
5. Enable **Allow public client flows** (toggle on)
6. Save the configuration

### Step 1.3: Configure API Permissions

1. Go to **API permissions** tab
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add permissions:
   - `User.Read`
   - `User.ReadWrite`
   - `profile`
   - `openid`
   - `email`
6. Grant admin consent if required

### Step 1.4: Generate Client Secret (Optional)

1. Go to **Certificates & secrets** tab
2. Click **New client secret**
3. Set expiration and copy the secret
4. Store securely (use for backend authentication if needed)

### Step 1.5: Gather Configuration Details

Save the following information:
- **Tenant ID**: From Overview tab
- **Client ID (Application ID)**: From Overview tab
- **Authority**: `https://login.microsoftonline.com/{TENANT_ID}`

## 2. Ionic 7 Project Setup

### Step 2.1: Install Required Packages

```bash
npm install @capacitor/browser @capacitor/app
```

### Step 2.2: Install Capacitor Plugins

```bash
npm install @capacitor/core @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

## 3. Configuration

### Step 3.1: Update environment.ts

Edit `src/environments/environment.ts` with your Azure credentials:

```typescript
export const environment = {
  production: false,
  clientId: 'YOUR_CLIENT_ID_FROM_AZURE',
  tenantId: 'YOUR_TENANT_ID_FROM_AZURE',
  redirectUri: 'msauth://YOUR_APP_PACKAGE/YOUR_SIGNATURE_HASH',
  authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
  msGraph: 'https://graph.microsoft.com/v1.0'
};
```

## 4. Build & Deployment

### Android Build

1. Get your app's signature hash:
   ```bash
   keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -list -v
   ```

2. Build and sync:
   ```bash
   ionic build
   npx cap sync android
   npx cap open android
   ```

3. Build and sign the APK in Android Studio.

### iOS Build

1. Build and sync:
   ```bash
   ionic build
   npx cap sync ios
   npx cap open ios
   ```

2. Configure bundle ID in Xcode (matching Azure configuration)

3. Build in Xcode.

## 5. Troubleshooting

- **Redirect URI mismatch**: Ensure redirect URIs match exactly in Azure and app configuration
- **Token expiration**: Implement token refresh logic (already included)
- **CORS issues**: Configure backend to accept requests from mobile app
- **Deep linking issues**: Verify app scheme configuration in native projects

## 6. Security Best Practices

- Never hardcode secrets in client-side code
- Use secure storage for tokens
- Implement token refresh before expiration
- Validate tokens on backend before granting access
- Use HTTPS for all API communications
- Test thoroughly on physical devices