import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const PROFILE_STORAGE_KEY = '@temoma_profile';

// Available profile pictures
const profilePictures = [
  { id: 'bear', name: 'Bear', image: require('../assets/profile_pictures/bear.png') },
  { id: 'bird', name: 'Bird', image: require('../assets/profile_pictures/bird.png') },
  { id: 'deer', name: 'Deer', image: require('../assets/profile_pictures/deer.png') },
];

interface ProfileData {
  selectedAvatar: string;
  joinDate: string;
  customDisplayName?: string;
}

export const useProfilePicture = () => {
  const [selectedAvatar, setSelectedAvatar] = useState('bear');
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const parsed: ProfileData = JSON.parse(storedProfile);
        setSelectedAvatar(parsed.selectedAvatar || 'bear');
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      // Keep default 'bear' avatar
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const getSelectedAvatarImage = useCallback(() => {
    const avatar = profilePictures.find(pic => pic.id === selectedAvatar);
    return avatar ? avatar.image : profilePictures[0].image;
  }, [selectedAvatar]);

  const refreshProfilePicture = useCallback(() => {
    setIsLoading(true);
    loadProfileData();
  }, [loadProfileData]);

  return {
    selectedAvatar,
    avatarImage: getSelectedAvatarImage(),
    isLoading,
    refreshProfilePicture,
  };
};
