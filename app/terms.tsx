import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Scaffold } from '../components/ui/Scaffold';

export default function TermsOfServiceScreen() {
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
      title="Terms of Service"
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
              Terms of Service
            </Text>
            <Text className="text-[#58E886]/70 text-center text-base">
              Please read these terms carefully
            </Text>
          </View>

          {/* Terms Sections */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="space-y-6"
          >
            {/* Acceptance of Terms */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="document-text" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Acceptance of Terms
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6">
                By using Temoma, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app.
              </Text>
            </View>

            {/* Service Description */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="apps" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Service Description
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                Temoma is a personal finance app that helps you:
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-2">
                • Track your expenses and income
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-2">
                • Set and manage budgets
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-2">
                • Get AI-powered financial insights
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6">
                • Visualize your spending patterns
              </Text>
            </View>

            {/* User Responsibilities */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="person-circle" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  User Responsibilities
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                You agree to:
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-2">
                • Provide accurate information
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-2">
                • Keep your account secure
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-2">
                • Use the app for lawful purposes only
              </Text>
              <Text className="text-[#58E886]/80 text-base leading-6">
                • Not attempt to hack or disrupt the service
              </Text>
            </View>

            {/* Data and Privacy */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="shield-checkmark" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Data and Privacy
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6 mb-3">
                Your financial data is stored securely and used only to provide our services. For detailed information about how we handle your data, please review our Privacy Policy.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/privacy' as any)}
                className="flex-row items-center"
              >
                <Text className="text-[#58E886] text-base font-semibold">
                  View Privacy Policy
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#58E886" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>

            {/* Service Availability */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="cloud" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Service Availability
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6">
                We strive to keep Temoma available 24/7, but we cannot guarantee uninterrupted service. We may perform maintenance or updates that temporarily affect availability.
              </Text>
            </View>

            {/* Limitation of Liability */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="warning" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Limitation of Liability
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6">
                Temoma is provided "as is" without warranties. We are not liable for any financial decisions made based on the app's data or recommendations. Always consult a financial advisor for important decisions.
              </Text>
            </View>

            {/* Account Termination */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="exit" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Account Termination
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6">
                You may delete your account at any time through the app settings. We may suspend or terminate accounts that violate these terms. Upon termination, your data will be deleted according to our Privacy Policy.
              </Text>
            </View>

            {/* Changes to Terms */}
            <View className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="refresh" size={24} color="#58E886" />
                <Text className="text-[#58E886] text-lg font-bold ml-3">
                  Changes to Terms
                </Text>
              </View>
              <Text className="text-[#58E886]/80 text-base leading-6">
                We may update these terms occasionally. Continued use of the app after changes constitutes acceptance of the new terms. We will notify users of significant changes.
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
                If you have questions about these terms, please contact us:
              </Text>
              <TouchableOpacity
                onPress={() => openExternalLink('mailto:legal@yourapp.com')}
                className="flex-row items-center"
              >
                <Text className="text-[#58E886] text-base font-semibold">
                  legal@yourapp.com
                </Text>
                <Ionicons name="open-outline" size={16} color="#58E886" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>

            {/* External Link Button */}
            <Animated.View entering={FadeInUp.delay(400).springify()}>
              <TouchableOpacity
                onPress={() => openExternalLink('https://yourwebsite.com/terms')}
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
                    View Full Terms Online
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
