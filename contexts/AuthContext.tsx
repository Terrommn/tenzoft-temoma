import { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../config/supabase';
import { useSupabase } from './SupabaseContext';

// User profile type
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string; user?: User }>;
  signUpWithGoogle: () => Promise<{ success: boolean; error?: string; user?: User }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<{ success: boolean; error?: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
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
  const { user, loading: supabaseLoading, initialized } = useSupabase();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialized) {
      setLoading(supabaseLoading);
      
      if (user) {
        // Create or fetch user profile
        setUserProfile({
          id: user.id,
          email: user.email || '',
          displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          photoURL: user.user_metadata?.avatar_url
        });
      } else {
        setUserProfile(null);
      }
    }
  }, [user, supabaseLoading, initialized]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'your-app://auth/callback', // You'll need to configure this
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data };
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
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

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
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: updates.displayName,
          avatar_url: updates.photoURL,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (userProfile) {
        setUserProfile({
          ...userProfile,
          displayName: updates.displayName || userProfile.displayName,
          photoURL: updates.photoURL || userProfile.photoURL,
        });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://auth/reset-password', // You'll need to configure this
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      console.log('Starting account deletion for user:', user.id);

      // Step 1: Delete user data from all tables (expenses, budgets, categories)
      const { error: expensesError } = await supabase
        .from('expenses')
        .delete()
        .eq('user_id', user.id);

      if (expensesError) {
        console.error('Error deleting expenses:', expensesError);
      }

      const { error: budgetsError } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', user.id);

      if (budgetsError) {
        console.error('Error deleting budgets:', budgetsError);
      }

      const { error: categoriesError } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', user.id);

      if (categoriesError) {
        console.error('Error deleting categories:', categoriesError);
      }

      // Step 2: Clear local storage
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.clear();
      } catch (storageError) {
        console.error('Error clearing local storage:', storageError);
      }

      // Step 3: Delete the user account from Supabase Auth
      // Note: This requires either admin privileges or a Supabase Edge Function
      // For now, we'll call a custom function that you'll need to set up
      try {
        const { data, error: deleteError } = await supabase.functions.invoke('delete-user', {
          body: { userId: user.id }
        });

        if (deleteError) {
          console.error('Error calling delete-user function:', deleteError);
          // Fall back to just signing out if the function doesn't exist
          await supabase.auth.signOut();
        }
      } catch (functionError) {
        console.error('Delete user function not available, signing out instead:', functionError);
        // If the function doesn't exist, just sign out
        await supabase.auth.signOut();
      }

      // Step 4: Clear user profile state
      setUserProfile(null);

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting account:', error);
      return { success: false, error: 'Failed to delete account. Please try again.' };
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
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 