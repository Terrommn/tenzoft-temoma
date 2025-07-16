# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "temoma-app")
4. Enable/disable Google Analytics as needed
5. Click "Create project"

## 2. Set up Authentication

1. In the Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Optionally enable other providers (Google, Apple, etc.)

## 3. Set up Firestore Database

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll set up security rules later)
4. Select a location closest to your users
5. Click "Done"

## 4. Configure Web App

1. In the Firebase Console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Enter app nickname (e.g., "temoma-web")
5. Click "Register app"
6. Copy the Firebase configuration object

## 5. Update Firebase Configuration

Replace the placeholder values in `config/firebase.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 6. Set up Firestore Security Rules

In the Firebase Console, go to "Firestore Database" > "Rules" and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only read/write their own categories
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only read/write their own budgets
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only read/write their own summaries
    match /summaries/{summaryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 7. Update App Layout

Wrap your app with the AuthProvider in `app/_layout.tsx`:

```typescript
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Your existing layout */}
    </AuthProvider>
  );
}
```

## 8. Test the Setup

1. Run your app
2. Try creating a new account
3. Check if the user appears in Firebase Authentication
4. Check if the user profile and default categories are created in Firestore

## 9. Environment Variables (Optional)

For better security, you can use environment variables:

1. Create a `.env` file in your project root
2. Add your Firebase config:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

3. Update `config/firebase.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
```

## 10. Next Steps

- Implement authentication screens
- Update existing screens to use Firebase instead of AsyncStorage
- Add real-time data synchronization
- Set up push notifications (optional)
- Add data export/import functionality 