import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Alert, Linking, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';

const PRIVACY_CONSENT_KEY = '@temoma_privacy_consent';
const PRIVACY_CONSENT_VERSION = '1.0';

interface PrivacyConsentProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const openPrivacyPolicy = async () => {
    try {
      const url = 'https://yourwebsite.com/privacy-policy';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open privacy policy link');
      }
    } catch (error) {
      console.error('Error opening privacy policy:', error);
    }
  };

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem(
        PRIVACY_CONSENT_KEY,
        JSON.stringify({
          version: PRIVACY_CONSENT_VERSION,
          acceptedAt: new Date().toISOString(),
          consents: {
            dataCollection: true,
            analytics: true,
            aiProcessing: true,
          },
        })
      );
      onAccept();
    } catch (error) {
      console.error('Error saving consent:', error);
      Alert.alert('Error', 'Failed to save privacy consent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem(
        PRIVACY_CONSENT_KEY,
        JSON.stringify({
          version: PRIVACY_CONSENT_VERSION,
          acceptedAt: new Date().toISOString(),
          consents: {
            dataCollection: false,
            analytics: false,
            aiProcessing: false,
          },
        })
      );
      onDecline();
    } catch (error) {
      console.error('Error saving consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-4">
        <Animated.View
          entering={SlideInUp.springify()}
          className="bg-[#001711] border-2 border-[#58E886]/40 rounded-3xl w-full max-w-lg max-h-[80%]"
          style={{
            shadowColor: '#58E886',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 16,
          }}
        >
          {/* Header */}
          <View className="p-6 pb-4 border-b border-[#58E886]/20">
            <Animated.View
              entering={FadeIn.delay(200)}
              className="flex-row items-center justify-center mb-2"
            >
              <Ionicons name="shield-checkmark" size={32} color="#58E886" />
              <Text className="text-[#58E886] text-2xl font-bold ml-3">
                Privacy Consent
              </Text>
            </Animated.View>
            <Animated.Text
              entering={FadeIn.delay(300)}
              className="text-[#58E886]/70 text-center text-base"
            >
              Your privacy is important to us
            </Animated.Text>
          </View>

          {/* Content */}
          <ScrollView
            className="flex-1 px-6 py-4"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              entering={FadeInDown.delay(400)}
              className="space-y-4"
            >
              <Text className="text-[#58E886] text-lg font-semibold mb-2">
                We collect and process data to:
              </Text>

              <View className="space-y-3">
                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={20} color="#58E886" style={{ marginTop: 2 }} />
                  <Text className="text-[#58E886]/80 text-base ml-3 flex-1">
                    Track your expenses and manage budgets
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={20} color="#58E886" style={{ marginTop: 2 }} />
                  <Text className="text-[#58E886]/80 text-base ml-3 flex-1">
                    Provide AI-powered financial insights
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={20} color="#58E886" style={{ marginTop: 2 }} />
                  <Text className="text-[#58E886]/80 text-base ml-3 flex-1">
                    Secure your account and data
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={20} color="#58E886" style={{ marginTop: 2 }} />
                  <Text className="text-[#58E886]/80 text-base ml-3 flex-1">
                    Improve our services
                  </Text>
                </View>
              </View>

              <View className="mt-6 p-4 bg-[#58E8861A] border border-[#58E8864D] rounded-2xl">
                <Text className="text-[#58E886] text-base font-semibold mb-2">
                  Your Rights:
                </Text>
                <Text className="text-[#58E886]/80 text-sm leading-5">
                  • Access, update, or delete your data at any time{'\n'}
                  • Withdraw consent and stop data processing{'\n'}
                  • Export your data{'\n'}
                  • Contact us with privacy concerns
                </Text>
              </View>

              <TouchableOpacity
                onPress={openPrivacyPolicy}
                className="mt-4 flex-row items-center justify-center p-3 border border-[#58E886]/40 rounded-xl"
              >
                <Ionicons name="document-text" size={20} color="#58E886" />
                <Text className="text-[#58E886] text-base font-medium ml-2">
                  Read Full Privacy Policy
                </Text>
                <Ionicons name="open-outline" size={16} color="#58E886" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>

          {/* Actions */}
          <Animated.View
            entering={FadeIn.delay(600)}
            className="p-6 pt-4 border-t border-[#58E886]/20 space-y-3"
          >
            <TouchableOpacity
              onPress={handleAccept}
              disabled={isLoading}
              className={`rounded-2xl py-4 px-6 border-2 ${
                isLoading
                  ? 'bg-[#58E886]/20 border-[#58E886]/30'
                  : 'bg-[#58E886] border-[#58E886]'
              }`}
              style={{
                shadowColor: '#58E886',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center justify-center">
                {isLoading ? (
                  <Ionicons name="reload" size={20} color="#001711" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="checkmark" size={20} color="#001711" style={{ marginRight: 8 }} />
                )}
                <Text className="text-center text-[#001711] font-bold text-lg">
                  {isLoading ? 'Processing...' : 'Accept & Continue'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDecline}
              disabled={isLoading}
              className="rounded-2xl py-4 px-6 border-2 border-[#58E886]/40 bg-transparent"
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="close" size={20} color="#58E886" style={{ marginRight: 8 }} />
                <Text className="text-center text-[#58E886] font-bold text-lg">
                  Decline & Exit
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Helper functions for consent management
export const getPrivacyConsent = async (): Promise<{
  hasConsent: boolean;
  consentData: any;
}> => {
  try {
    const consentString = await AsyncStorage.getItem(PRIVACY_CONSENT_KEY);
    if (!consentString) {
      return { hasConsent: false, consentData: null };
    }

    const consentData = JSON.parse(consentString);
    const hasValidConsent = 
      consentData.version === PRIVACY_CONSENT_VERSION &&
      consentData.consents?.dataCollection === true;

    return { hasConsent: hasValidConsent, consentData };
  } catch (error) {
    console.error('Error getting privacy consent:', error);
    return { hasConsent: false, consentData: null };
  }
};

export const clearPrivacyConsent = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PRIVACY_CONSENT_KEY);
  } catch (error) {
    console.error('Error clearing privacy consent:', error);
  }
};

export const updatePrivacyConsent = async (consents: {
  dataCollection?: boolean;
  analytics?: boolean;
  aiProcessing?: boolean;
}): Promise<void> => {
  try {
    const existingConsent = await AsyncStorage.getItem(PRIVACY_CONSENT_KEY);
    const existingData = existingConsent ? JSON.parse(existingConsent) : {};

    const updatedConsent = {
      ...existingData,
      version: PRIVACY_CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
      consents: {
        ...existingData.consents,
        ...consents,
      },
    };

    await AsyncStorage.setItem(PRIVACY_CONSENT_KEY, JSON.stringify(updatedConsent));
  } catch (error) {
    console.error('Error updating privacy consent:', error);
    throw error;
  }
};
