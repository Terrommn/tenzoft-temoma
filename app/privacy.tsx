import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Scaffold } from '../components/ui/Scaffold';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open this link');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Unable to open this link');
    }
  };

  return (
    <Scaffold
      title="Privacy Policy"
      showBack={true}
      onBack={() => router.back()}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 }}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="space-y-6"
        >
          {/* Header */}
          <View className="mb-6">
            <Text className="text-[#58E886] text-2xl font-bold text-center mb-2">
              Privacy Policy
            </Text>
            <Text className="text-[#58E886]/70 text-center text-base">
              How we protect and handle your data
            </Text>
          </View>

          {/* Privacy Sections */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="space-y-6"
          >
            {/* Data Collection */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="shield-checkmark" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Information We Collect
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Email address and account credentials
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Financial data (expenses, budgets, categories)
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Profile information and preferences
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6">
                • Chat conversations with Temoma AI
              </Text>
            </View>

            {/* How We Use Data */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="analytics" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  How We Use Your Data
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Provide expense tracking and budget management
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Power AI insights and personalized recommendations
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Maintain your account and app functionality
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6">
                • Improve our services and user experience
              </Text>
            </View>

            {/* Data Security */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="lock-closed" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Data Security
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • All data transmission uses HTTPS encryption
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Secure cloud storage with Supabase
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • No data sharing with unauthorized third parties
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6">
                • Regular security audits and updates
              </Text>
            </View>

            {/* Your Rights */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="person-circle" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Your Rights
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Access and review your personal data
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Update or correct your information
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Delete your account and data
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6">
                • Withdraw consent for data processing
              </Text>
            </View>

            {/* Third Party Services */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="link" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Third-Party Services
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Supabase: Database and authentication
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                • Google Services: Optional sign-in
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6">
                • Gemini AI: Financial insights and chat
              </Text>
            </View>

            {/* Contact */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="mail" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Contact Us
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                For privacy-related questions or to exercise your rights, contact us at:
              </Text>
              <TouchableOpacity
                onPress={() => openExternalLink('mailto:tenzorial.industries@gmail.com')}
                className="flex-row items-center"
              >
                <Text className="text-[#58E886] text-base font-semibold">
                  tenzorial.industries@gmail.com
                </Text>
                <Ionicons name="open-outline" size={16} color="#58E886" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>

            {/* External Link Button */}
            <Animated.View entering={FadeInUp.delay(400).springify()}>
              <TouchableOpacity
                onPress={() => openExternalLink('https://www.freeprivacypolicy.com/live/f1c25f6c-b0ce-4d44-8705-bced38478846')}
                className="mt-6 rounded-2xl py-4 px-6 border-2 bg-[#58E886] border-[#58E886]"
                style={{
                  shadowColor: '#58E886',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="globe" size={20} color="#001711" style={{ marginRight: 8 }} />
                  <Text className="text-center text-[#001711] font-bold text-lg">
                    View Full Privacy Policy
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Last Updated */}
            <View className="mt-6 items-center">
              <Text className="text-[#58E886]/50 text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </Scaffold>
  );
}
