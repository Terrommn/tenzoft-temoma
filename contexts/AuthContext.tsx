import React, { createContext, useContext, useEffect, useState } from 'react';

// Mock user type
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Mock user profile type
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface AuthContextType {
  user: MockUser | null;
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
  const [user, setUser] = useState<MockUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock successful sign in
      const mockUser: MockUser = {
        uid: 'mock-user-id',
        email: email,
        displayName: 'Mock User'
      };
      setUser(mockUser);
      setUserProfile({
        id: mockUser.uid,
        email: email,
        displayName: 'Mock User'
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      // Mock successful sign up
      const mockUser: MockUser = {
        uid: 'mock-user-id',
        email: email,
        displayName: displayName || 'Mock User'
      };
      setUser(mockUser);
      setUserProfile({
        id: mockUser.uid,
        email: email,
        displayName: displayName || 'Mock User'
      });
      return { success: true, user: mockUser };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Mock successful Google sign in
      const mockUser: MockUser = {
        uid: 'mock-google-user-id',
        email: 'mock@gmail.com',
        displayName: 'Mock Google User'
      };
      setUser(mockUser);
      setUserProfile({
        id: mockUser.uid,
        email: 'mock@gmail.com',
        displayName: 'Mock Google User'
      });
      return { success: true, user: mockUser };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    return signInWithGoogle();
  };

  const signOut = async () => {
    setLoading(true);
    try {
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    try {
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          ...updates
        });
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      // Mock successful password reset
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // Mock successful password change
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 