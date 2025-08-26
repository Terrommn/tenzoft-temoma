import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Scaffold } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { signIn, signUp, signInWithGoogle, sendPasswordResetEmail } = useAuth();

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, displayName);
      } else {
        result = await signIn(email, password);
      }

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', result.error || 'Authentication failed');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', result.error || 'Google authentication failed');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const result = await sendPasswordResetEmail(resetEmail);
      if (result.success) {
        Alert.alert('Success', 'Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
        setResetEmail('');
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset email');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <Scaffold>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center px-8">
            <View className="items-center mb-12">
              <Text className="text-4xl font-bold text-[#58E886] mb-2">
                🔒 Reset Password
              </Text>
              <Text className="text-lg text-[#D8DEE9] text-center">
                Enter your email to receive a reset link
              </Text>
            </View>

            <View className="mb-8">
              <TextInput
                className="bg-[#2E3440] text-[#D8DEE9] px-4 py-4 rounded-lg mb-4 text-lg"
                placeholder="Email"
                placeholderTextColor="#4C566A"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                className="bg-[#58E886] py-4 rounded-lg mb-4"
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text className="text-[#001711] text-center font-bold text-lg">
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-2"
                onPress={() => setShowForgotPassword(false)}
              >
                <Text className="text-[#58E886] text-center font-medium">
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Scaffold>
    );
  }

  return (
    <Scaffold>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-8">
          <View className="items-center mb-12">
            <Text className="text-4xl  text-center font-bold text-[#58E886] mb-2">
             Welcome to Temoma
            </Text>
            <Text className="text-lg text-[#D8DEE9] text-center">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </Text>
          </View>

          {/* Email/Password Form */}
          <View className="mb-8">
            {isSignUp && (
              <TextInput
                className="bg-[#2E3440] text-[#D8DEE9] px-4 py-4 rounded-lg mb-4 text-lg"
                placeholder="Display Name"
                placeholderTextColor="#4C566A"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            )}

            <TextInput
              className="bg-[#2E3440] text-[#D8DEE9] px-4 py-4 rounded-lg mb-4 text-lg"
              placeholder="Email"
              placeholderTextColor="#4C566A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              className="bg-[#2E3440] text-[#D8DEE9] px-4 py-4 rounded-lg mb-6 text-lg"
              placeholder="Password"
              placeholderTextColor="#4C566A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Privacy and Terms Checkboxes for Sign Up */}
            {isSignUp && (
              <View className="mb-6 space-y-4">
                {/* Privacy Policy Checkbox */}
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                >
                  <View className={`w-5 h-5 rounded-full border-2 border-[#58E886] mr-3 items-center justify-center ${acceptedPrivacy ? 'bg-[#58E886]' : 'bg-transparent'}`}>
                    {acceptedPrivacy && (
                      <Ionicons name="checkmark" size={12} color="#001711" />
                    )}
                  </View>
                  <View className="flex-1 flex-row flex-wrap">
                    <Text className="text-[#D8DEE9]">I accept the </Text>
                    <TouchableOpacity onPress={() => router.push('/privacy' as any)}>
                      <Text className="text-[#58E886] underline">Privacy Policy</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                {/* Terms of Service Checkbox */}
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                >
                  <View className={`w-5 h-5 rounded-full border-2 border-[#58E886] mr-3 items-center justify-center ${acceptedTerms ? 'bg-[#58E886]' : 'bg-transparent'}`}>
                    {acceptedTerms && (
                      <Ionicons name="checkmark" size={12} color="#001711" />
                    )}
                  </View>
                  <View className="flex-1 flex-row flex-wrap">
                    <Text className="text-[#D8DEE9]">I accept the </Text>
                    <TouchableOpacity onPress={() => router.push('/terms' as any)}>
                      <Text className="text-[#58E886] underline">Terms of Service</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              className={`py-4 rounded-lg mb-4 ${
                loading || (isSignUp && (!acceptedPrivacy || !acceptedTerms))
                  ? 'bg-gray-500/50' 
                  : 'bg-[#58E886]'
              }`}
              onPress={handleEmailAuth}
              disabled={loading || (isSignUp && (!acceptedPrivacy || !acceptedTerms))}
            >
              <Text className={`text-center font-bold text-lg ${
                loading || (isSignUp && (!acceptedPrivacy || !acceptedTerms))
                  ? 'text-gray-400'
                  : 'text-[#001711]'
              }`}>
                {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Text>
            </TouchableOpacity>

            {!isSignUp && (
              <TouchableOpacity
                className="py-2 mb-4"
                onPress={() => setShowForgotPassword(true)}
              >
                <Text className="text-[#58E886] text-center font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}
          </View>

        



          {/* Toggle Sign Up/Sign In */}
          <View className="flex-row justify-center pt-5l.terr">
            <Text className="text-[#D8DEE9]">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text className="text-[#58E886] font-bold">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Scaffold>
  );
} 