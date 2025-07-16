import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { UserProfile } from '../types/models';
import { createUserProfile, getUserProfile } from './database';

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, displayName?: string) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update display name if provided
      if (displayName) {
        await user.updateProfile({ displayName });
      }
      
      // Create user profile in Firestore
      await createUserProfile(user.uid, {
        email: user.email!,
        displayName: displayName || user.displayName || '',
        photoURL: user.photoURL || undefined,
      });
      
      return { success: true, user };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in with Google
  static async signInWithGoogle() {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      
      if (!idToken) {
        throw new Error('Failed to get ID token from Google Sign-In');
      }
      
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const result = await auth().signInWithCredential(googleCredential);
      const user = result.user;
      
      // Check if user profile exists, create if not
      let profile = await getUserProfile(user.uid);
      if (!profile) {
        await createUserProfile(user.uid, {
          email: user.email!,
          displayName: user.displayName || '',
          photoURL: user.photoURL || undefined,
        });
      }
      
      return { success: true, user };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign up with Google (same as sign in for Google)
  static async signUpWithGoogle() {
    return this.signInWithGoogle();
  }
  
  // Sign out
  static async signOut() {
    try {
      await auth().signOut();
      await GoogleSignin.signOut(); // Also sign out from Google
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get current user
  static getCurrentUser() {
    return auth().currentUser;
  }
  
  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: any) => void) {
    return auth().onAuthStateChanged(callback);
  }
  
  // Update user profile
  static async updateUserProfile(updates: { displayName?: string; photoURL?: string }) {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('No user logged in');
      
      await user.updateProfile(updates);
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Send password reset email
  static async sendPasswordResetEmail(email: string) {
    try {
      await auth().sendPasswordResetEmail(email);
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Change password
  static async changePassword(currentPassword: string, newPassword: string) {
    try {
      const user = auth().currentUser;
      if (!user || !user.email) throw new Error('No user logged in');
      
      // Re-authenticate user
      const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      
      // Update password
      await user.updatePassword(newPassword);
      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get user profile with extended data
  static async getUserProfileData(): Promise<UserProfile | null> {
    try {
      const user = auth().currentUser;
      if (!user) return null;
      
      const profile = await getUserProfile(user.uid);
      return profile;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }
} 