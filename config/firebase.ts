import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
// IMPORTANT: You need to get your web client ID from Google Cloud Console
// 1. Go to https://console.cloud.google.com/
// 2. Select your 'temoma' project
// 3. Go to APIs & Services > Credentials
// 4. Find the Web client (auto created by Google Service) and copy its Client ID
GoogleSignin.configure({
  webClientId: '853473079717-REPLACE_WITH_YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace this with your actual web client ID
});

// Export Firebase services
export { auth, firestore };
export const db = firestore();

export default {
  auth,
  firestore,
  db,
}; 