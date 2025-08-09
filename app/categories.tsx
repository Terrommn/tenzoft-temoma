import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  SlideInRight
} from 'react-native-reanimated';
import { Scaffold } from '../components/ui';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

const availableIcons = [
  'restaurant', 'car', 'bag', 'receipt', 'game-controller', 'medical',
  'home', 'airplane', 'school', 'fitness', 'cafe', 'gift', 'book',
  'musical-notes', 'pizza', 'wine', 'cut', 'beer', 'bicycle', 'bus',
  'leaf'
];

const availableColors = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500'
];

const CATEGORIES_STORAGE_KEY = '@temoma_categories';

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('restaurant');
  const [selectedColor, setSelectedColor] = useState('bg-red-500');
  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense');
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const storedCategories = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        // Set default categories
        const defaultCategories = [
          // Expense Categories
          { id: '1', name: 'Food', icon: 'restaurant', color: 'bg-orange-500', type: 'expense' as const },
          { id: '2', name: 'Transport', icon: 'car', color: 'bg-blue-500', type: 'expense' as const },
          { id: '3', name: 'Shopping', icon: 'bag', color: 'bg-purple-500', type: 'expense' as const },
          { id: '4', name: 'Bills', icon: 'receipt', color: 'bg-red-500', type: 'expense' as const },
          { id: '5', name: 'Entertainment', icon: 'game-controller', color: 'bg-pink-500', type: 'expense' as const },
          { id: '6', name: 'Health', icon: 'medical', color: 'bg-green-500', type: 'expense' as const },
          // Income Categories
          { id: '7', name: 'Salary', icon: 'briefcase', color: 'bg-emerald-500', type: 'income' as const },
          { id: '8', name: 'Freelance', icon: 'laptop', color: 'bg-cyan-500', type: 'income' as const },
          { id: '9', name: 'Investment', icon: 'trending-up', color: 'bg-indigo-500', type: 'income' as const },
          { id: '10', name: 'Business', icon: 'business', color: 'bg-lime-500', type: 'income' as const },
        ];
        setCategories(defaultCategories);
        await saveCategories(defaultCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const saveCategories = async (categoriesToSave: Category[]) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categoriesToSave));
    } catch (error) {
      console.error('Error saving categories:', error);
      Alert.alert('Error', 'Failed to save categories');
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      Alert.alert('Error', 'A category with this name already exists');
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      icon: selectedIcon,
      color: selectedColor,
      type: selectedType,
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    await saveCategories(updatedCategories);

    setNewCategoryName('');
    setSelectedIcon('restaurant');
    setSelectedColor('bg-red-500');
    setSelectedType('expense');

    Alert.alert('Success', 'Category added successfully!');
  };

  const deleteCategory = async (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This will also remove it from all expenses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedCategories = categories.filter(cat => cat.id !== categoryId);
            setCategories(updatedCategories);
            await saveCategories(updatedCategories);
          },
        },
      ]
    );
  };

  const renderCategoryItem = (category: Category, index: number) => (
    <Animated.View
      key={category.id}
      entering={SlideInRight.delay(index * 100)}
      className="mb-3"
    >
      <View className="bg-[#001711]/40 border-2 border-[#58E886]/20 rounded-3xl p-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${category.color}`}>
            <Ionicons name={category.icon as any} size={24} color="#FFFFFF" />
          </View>
          <Text className="text-[#FFFFFF] text-lg font-semibold">
            {category.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => deleteCategory(category.id)}
          className="w-8 h-8 rounded-full bg-red-500/20 items-center justify-center"
        >
          <Ionicons name="trash" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <Scaffold
      title="Manage Categories"
      showBack={true}
      onBack={() => router.back()}
    >
      <View className="flex-1 px-2" style={{ backgroundColor: 'rgba(0, 23, 17, 0.3)' }}>
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Add New Category Section */}
          <Animated.View entering={FadeInDown.delay(100)} className="mb-8">
            <View className="bg-[#001711]/40 border-2 border-[#58E886]/30 rounded-3xl p-6">
              <Text className="text-[#58E886] text-xl font-bold mb-4">Add New Category</Text>
              
              {/* Category Name Input */}
              <View className="mb-4">
                <Text className="text-[#58E886] text-sm font-semibold mb-2">Category Name</Text>
                <TextInput
                  className="bg-[#003030]/50 border-2 border-[#58E886]/30 rounded-2xl px-4 py-3 text-[#FFFFFF] text-base"
                  placeholder="Enter category name..."
                  placeholderTextColor="#6B7280"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
              </View>

              {/* Category Type Selection */}
              <View className="mb-4">
                <Text className="text-[#58E886] text-sm font-semibold mb-3">Category Type</Text>
                <View className="flex-row bg-[#003030]/50 rounded-2xl p-2 border-2 border-[#58E886]/30">
                  <TouchableOpacity
                    onPress={() => setSelectedType('expense')}
                    className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center ${
                      selectedType === 'expense'
                        ? 'bg-red-500/20 border border-red-500/40'
                        : 'bg-transparent'
                    }`}
                    activeOpacity={0.8}
                  >
                    <Text className={`font-bold ${
                      selectedType === 'expense' ? 'text-red-400' : 'text-[#58E886]'
                    }`}>
                      Expense
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => setSelectedType('income')}
                    className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center ${
                      selectedType === 'income'
                        ? 'bg-green-500/20 border border-green-500/40'
                        : 'bg-transparent'
                    }`}
                    activeOpacity={0.8}
                  >
                    <Text className={`font-bold ${
                      selectedType === 'income' ? 'text-green-400' : 'text-[#58E886]'
                    }`}>
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Icon Selection */}
              <View className="mb-4">
                <Text className="text-[#58E886] text-sm font-semibold mb-3">Select Icon</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {availableIcons.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      onPress={() => setSelectedIcon(icon)}
                      className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${
                        selectedIcon === icon ? 'bg-[#58E886]' : 'bg-[#003030]/50 border-2 border-[#58E886]/20'
                      }`}
                    >
                      <Ionicons
                        name={icon as any}
                        size={20}
                        color={selectedIcon === icon ? '#001711' : '#58E886'}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Color Selection */}
              <View className="mb-6">
                <Text className="text-[#58E886] text-sm font-semibold mb-3">Select Color</Text>
                <View className="flex-row flex-wrap">
                  {availableColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full mr-3 mb-3 ${
                        selectedColor === color ? 'border-4 border-[#58E886]' : ''
                      } ${color}`}
                    />
                  ))}
                </View>
              </View>

              {/* Add Button */}
              <TouchableOpacity
                onPress={addCategory}
                className="bg-[#58E886] rounded-2xl py-4 px-6 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-[#001711] text-lg font-bold">Add Category</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Existing Categories */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text className="text-[#58E886] text-xl font-bold mb-4">Existing Categories</Text>
            
            {/* Expense Categories */}
            <Text className="text-[#58E886] text-lg font-semibold mb-3">Expense Categories</Text>
            {categories.filter(cat => cat.type === 'expense').map((category, index) => renderCategoryItem(category, index))}
            
            {categories.filter(cat => cat.type === 'expense').length === 0 && !isLoading && (
              <Text className="text-[#58E886]/60 text-center text-sm py-4 mb-4">
                No expense categories yet.
              </Text>
            )}
            
            {/* Income Categories */}
            <Text className="text-[#58E886] text-lg font-semibold mb-3 mt-6">Income Categories</Text>
            {categories.filter(cat => cat.type === 'income').map((category, index) => renderCategoryItem(category, index))}
            
            {categories.filter(cat => cat.type === 'income').length === 0 && !isLoading && (
              <Text className="text-[#58E886]/60 text-center text-sm py-4">
                No income categories yet.
              </Text>
            )}
            
            {categories.length === 0 && !isLoading && (
              <Text className="text-[#58E886]/60 text-center text-base py-8">
                No categories yet. Add your first category above!
              </Text>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </Scaffold>
  );
} 