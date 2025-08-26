import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn
} from 'react-native-reanimated';
import { Scaffold } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useProfilePicture } from '../hooks/useProfilePicture';

const PROFILE_STORAGE_KEY = '@temoma_profile';

// Available profile pictures
const profilePictures = [
  { id: 'bear', name: 'Terrommn', image: require('../assets/profile_pictures/bear.png') },
  { id: 'deer', name: 'Marushka', image: require('../assets/profile_pictures/deer.png') },
  { id: 'bird', name: 'Tenzin', image: require('../assets/profile_pictures/bird.png') },

];

interface ProfileData {
  selectedAvatar: string;
  joinDate: string;
  customDisplayName?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, deleteAccount } = useAuth();
  const { refreshProfilePicture } = useProfilePicture();
  const [profileData, setProfileData] = useState<ProfileData>({
    selectedAvatar: 'bear',
    joinDate: new Date().toISOString(),
  });
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfileData();
    if (user) {
      setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '');
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfileData(parsed);
      } else {
        // Set default profile data with current date
        const defaultProfile = {
          selectedAvatar: 'bear',
          joinDate: user?.created_at || new Date().toISOString(),
        };
        setProfileData(defaultProfile);
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const saveProfileData = async (newData: ProfileData) => {
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newData));
      setProfileData(newData);
    } catch (error) {
      console.error('Error saving profile data:', error);
      Alert.alert('Error', 'Failed to save profile data');
    }
  };

  const handleAvatarSelect = async (avatarId: string) => {
    const newProfileData = { ...profileData, selectedAvatar: avatarId };
    await saveProfileData(newProfileData);
    // Refresh the profile picture hook so other screens see the change
    refreshProfilePicture();
  };

  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      // Update in Supabase
      const result = await updateProfile({ displayName: displayName.trim() });
      
      if (result.success) {
        // Save locally as well
        const newProfileData = { ...profileData, customDisplayName: displayName.trim() };
        await saveProfileData(newProfileData);
        setIsEditing(false);
        Alert.alert('Success', 'Display name updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update display name');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update display name');
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedAvatar = () => {
    return profilePictures.find(pic => pic.id === profileData.selectedAvatar) || profilePictures[0];
  };

  const formatJoinDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Unknown';
    }
  };

  const getCurrentDisplayName = () => {
    return profileData.customDisplayName || 
           user?.user_metadata?.display_name || 
           user?.email?.split('@')[0] || 
           'User';
  };

  return (
    <Scaffold
      title="Profile"
      showBack={true}
      onBack={() => router.back()}
    >
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="space-y-6"
        >
          {/* Profile Header */}
          <View
            className="bg-[#58E886]/10 border-2 border-[#58E886]/30 rounded-3xl p-6 items-center"
            style={{
              shadowColor: '#58E886',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Animated.View
              entering={ZoomIn.delay(200)}
              className="items-center"
            >
              {/* Avatar */}
              <View className="w-24 h-24 rounded-full bg-[#58E886]/20 border-4 border-[#58E886] items-center justify-center mb-4 overflow-hidden">
                <Image
                  source={getSelectedAvatar().image}
                  style={{ width: 80, height: 80 }}
                  resizeMode="cover"
                />
              </View>

              {/* Display Name */}
              {isEditing ? (
                <View className="w-full items-center space-y-3">
                  <TextInput
                    className="bg-[#002a20]/30 border border-[#58E886]/40 rounded-2xl px-4 py-3 text-white text-lg font-semibold text-center min-w-48"
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Enter display name"
                    placeholderTextColor="#58E886"
                    autoFocus
                  />
                  <View className="flex-row space-x-3">
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditing(false);
                        setDisplayName(getCurrentDisplayName());
                      }}
                      className="bg-gray-500/20 border border-gray-500/40 rounded-xl px-4 py-2"
                      activeOpacity={0.8}
                    >
                      <Text className="text-gray-400 font-semibold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveDisplayName}
                      disabled={isSaving}
                      className="bg-accent-green/20 border border-accent-green/40 rounded-xl px-4 py-2"
                      activeOpacity={0.8}
                    >
                      <Text className="text-accent-green font-semibold">
                        {isSaving ? 'Saving...' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-xl font-bold mb-1">
                    {getCurrentDisplayName()}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="pencil" size={14} color="#58E886" />
                    <Text className="text-[#58E886] text-sm ml-1">Tap to edit</Text>
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>

          {/* User Info */}
          <Animated.View
            entering={FadeInUp.delay(300)}
            className="bg-[#58E886]/10 border-2 border-[#58E886]/30 rounded-3xl p-6"
            style={{
              shadowColor: '#58E886',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text className="text-[#58E886] text-lg font-bold mb-4 text-center">Account Information</Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center justify-between py-3 border-b border-[#58E886]/20">
                <View className="flex-row items-center">
                  <Ionicons name="mail" size={20} color="#58E886" />
                  <Text className="text-[#58E886] font-semibold ml-3">Email</Text>
                </View>
                <Text className="text-white text-right flex-1 ml-3" numberOfLines={1}>
                  {user?.email || 'No email'}
                </Text>
              </View>

              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={20} color="#58E886" />
                  <Text className="text-[#58E886] font-semibold ml-3">Joined</Text>
                </View>
                <Text className="text-white">
                  {formatJoinDate(profileData.joinDate)}
                </Text>
              </View>

            
            </View>
          </Animated.View>

          {/* Avatar Selection */}
          <Animated.View
            entering={FadeInUp.delay(400)}
            className="bg-[#58E886]/10 border-2 border-[#58E886]/30 rounded-3xl p-6"
            style={{
              shadowColor: '#58E886',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text className="text-[#58E886] text-lg font-bold mb-4 text-center">Choose Avatar</Text>
            
            <View className="flex-row justify-around">
              {profilePictures.map((picture, index) => (
                <TouchableOpacity
                  key={picture.id}
                  onPress={() => handleAvatarSelect(picture.id)}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    entering={ZoomIn.delay(500 + index * 100)}
                    className={`items-center p-3 rounded-2xl ${
                      profileData.selectedAvatar === picture.id
                        ? 'bg-[#58E886]/20 border-2 border-[#58E886]'
                        : 'bg-[#002a20]/30 border-2 border-[#58E886]/20'
                    }`}
                  >
                    <View className="w-16 h-16 rounded-full bg-[#58E886]/10 items-center justify-center mb-2 overflow-hidden">
                      <Image
                        source={picture.image}
                        style={{ width: 56, height: 56 }}
                        resizeMode="cover"
                      />
                    </View>
                    <Text
                      className={`font-semibold text-sm ${
                        profileData.selectedAvatar === picture.id
                          ? 'text-[#58E886]'
                          : 'text-white'
                      }`}
                    >
                      {picture.name}
                    </Text>
                    {profileData.selectedAvatar === picture.id && (
                      <Ionicons name="checkmark-circle" size={16} color="#58E886" />
                    )}
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Privacy & Account Section */}
          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            className="mt-8 space-y-4"
          >
            <Text className="text-[#58E886] text-xl font-bold mb-4">
              Privacy & Account
            </Text>

            {/* Privacy Policy */}
            <TouchableOpacity
              onPress={() => router.push('/privacy' as any)}
              className="bg-[#58E8861A] border border-[#58E8864D] rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="shield-checkmark" size={24} color="#58E886" />
                <View className="ml-3 flex-1">
                  <Text className="text-[#58E886] text-lg font-semibold">
                    Privacy Policy
                  </Text>
                  <Text className="text-[#58E886]/60 text-sm">
                    How we protect your data
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#58E886" />
            </TouchableOpacity>


            {/* Delete Account */}
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'This will permanently delete your account and all data. This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Delete Account', 
                      style: 'destructive',
                      onPress: async () => {
                        const result = await deleteAccount();
                        if (result.success) {
                          router.replace('/login');
                        } else {
                          Alert.alert('Error', result.error || 'Failed to delete account');
                        }
                      }
                    }
                  ]
                );
              }}
              className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="trash" size={24} color="#ef4444" />
                <View className="ml-3 flex-1">
                  <Text className="text-red-400 text-lg font-semibold">
                    Delete Account
                  </Text>
                  <Text className="text-red-400/60 text-sm">
                    Permanently remove all data
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </Scaffold>
  );
}
