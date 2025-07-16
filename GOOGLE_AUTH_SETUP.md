# Google Authentication Setup Guide

This guide will help you set up Google authentication for your React Native app using Firebase.

## Prerequisites

1. Complete the basic Firebase setup as outlined in `FIREBASE_SETUP.md`
2. Have your Firebase project ready
3. Have your React Native app configured with Firebase

## Step 1: Enable Google Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Click on **Google** in the provider list
5. Toggle the **Enable** switch
6. Add your **Project support email**
7. Click **Save**

## Step 2: Configure OAuth consent screen (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** > **OAuth consent screen**
4. Configure the consent screen:
   - **App name**: Your app name
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Add scopes if needed (usually not required for basic auth)
6. Save and continue

## Step 3: Create OAuth 2.0 credentials

### For Web (if using Expo Go or web)
1. In Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Select **Web application**
4. Add authorized domains:
   - `localhost` (for development)
   - Your production domain
5. Copy the **Client ID** and **Client Secret**

### For Android
1. In Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Select **Android**
4. Add package name: `com.yourcompany.yourapp`
5. Add SHA-1 certificate fingerprint:
   - For development: Run `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - For production: Use your release keystore SHA-1
6. Click **Create**

### For iOS
1. In Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Select **iOS**
4. Add bundle identifier: `com.yourcompany.yourapp`
5. Click **Create**

## Step 4: Configure Firebase project

1. In Firebase Console, go to **Project Settings**
2. In the **General** tab, add your platforms:
   - For Android: Add your package name and SHA-1 certificate
   - For iOS: Add your bundle identifier
3. Download updated configuration files:
   - `google-services.json` for Android
   - `GoogleService-Info.plist` for iOS

## Step 5: Install required dependencies

```bash
npm install @react-native-firebase/auth @react-native-google-signin/google-signin
```

## Step 6: Platform-specific configuration

### Android Configuration

1. Place `google-services.json` in `android/app/` directory
2. Add to `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

3. Add to `android/build.gradle`:
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
}
```

### iOS Configuration

1. Place `GoogleService-Info.plist` in your iOS project root
2. Add to your `ios/YourApp/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>REVERSED_CLIENT_ID</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

Replace `YOUR_REVERSED_CLIENT_ID` with the value from your `GoogleService-Info.plist`.

## Step 7: Configure Google Sign-In

If using the Google Sign-In package, add this to your app initialization:

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // From Google Cloud Console
});
```

## Step 8: Testing

1. Run your app: `npm start`
2. Try signing in with Google
3. Check Firebase Console > Authentication > Users to see registered users

## Troubleshooting

### Common Issues

1. **"API key not valid"**: Check your OAuth 2.0 credentials in Google Cloud Console
2. **"Sign in failed"**: Ensure SHA-1 certificate is correctly configured
3. **"The given sign-in provider is disabled"**: Enable Google provider in Firebase Console
4. **Web client not configured**: Add web client ID to GoogleSignin.configure()

### Debug Steps

1. Check Firebase Console logs
2. Verify SHA-1 certificate matches
3. Ensure package name/bundle ID matches
4. Check Google Cloud Console API quotas

## Security Notes

- Never commit client secrets to version control
- Use environment variables for sensitive data
- Keep SHA-1 certificates secure
- Regularly rotate credentials for production apps

## Current Implementation Status

The authentication screens have been created with:
- ✅ Email/password authentication
- ✅ Google sign-in button (UI ready)
- ✅ Sign-up and sign-in flows
- ✅ Password reset functionality
- ✅ Authentication state management
- ✅ Protected routes

The Google authentication will work once you complete the platform-specific setup above.

## Next Steps

1. Complete the platform-specific configuration
2. Test Google authentication on your target platforms
3. Add additional OAuth providers if needed
4. Implement user profile management
5. Add email verification if required 