import { User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/auth';
import { initializeDefaultCategories } from '../services/database';
import { UserProfile } from '../types/models';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signUpWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<{ success: boolean; error?: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        // Load user profile
        const profile = await AuthService.getUserProfileData();
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await AuthService.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const result = await AuthService.signUp(email, password, displayName);
      
      // If signup successful, initialize default categories
      if (result.success && result.user) {
        await initializeDefaultCategories(result.user.uid);
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await AuthService.signInWithGoogle();
      
      // If signup successful, initialize default categories
      if (result.success && result.user) {
        await initializeDefaultCategories(result.user.uid);
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    return signInWithGoogle(); // Same as sign in for Google
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await AuthService.signOut();
      return result;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    try {
      const result = await AuthService.updateUserProfile(updates);
      
      if (result.success) {
        // Refresh user profile
        const profile = await AuthService.getUserProfileData();
        setUserProfile(profile);
      }
      
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    return await AuthService.sendPasswordResetEmail(email);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    return await AuthService.changePassword(currentPassword, newPassword);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signUpWithGoogle,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 