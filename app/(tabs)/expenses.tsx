import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  BounceIn,
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';
import { Scaffold } from '../../components/ui';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
}

const categories = [
  { name: 'Food', icon: 'restaurant', color: 'bg-orange-500' },
  { name: 'Transport', icon: 'car', color: 'bg-blue-500' },
  { name: 'Shopping', icon: 'bag', color: 'bg-purple-500' },
  { name: 'Bills', icon: 'receipt', color: 'bg-red-500' },
  { name: 'Entertainment', icon: 'game-controller', color: 'bg-pink-500' },
  { name: 'Health', icon: 'medical', color: 'bg-green-500' },
];

const STORAGE_KEY = '@temoma_expenses';

export default function ExpensesTab() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load expenses from AsyncStorage on component mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        // Convert date strings back to Date objects
        const expensesWithDates = parsedExpenses.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
        }));
        setExpenses(expensesWithDates);
      } else {
        // Set default expenses if no data exists
        const defaultExpenses = [
          {
            id: '1',
            title: 'Grocery Shopping',
            amount: 85.50,
            category: 'Food',
            date: new Date(),
          },
          {
            id: '2',
            title: 'Uber Ride',
            amount: 12.30,
            category: 'Transport',
            date: new Date(),
          },
        ];
        setExpenses(defaultExpenses);
        await saveExpenses(defaultExpenses);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      Alert.alert('Error', 'Failed to load expenses from storage');
    } finally {
      setIsLoading(false);
    }
  };

  const saveExpenses = async (expensesToSave: Expense[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expensesToSave));
    } catch (error) {
      console.error('Error saving expenses:', error);
      Alert.alert('Error', 'Failed to save expenses to storage');
    }
  };

  const addExpense = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: parseFloat(amount),
      category: selectedCategory,
      date: new Date(),
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
    
    setTitle('');
    setAmount('');
    setShowForm(false);
    
    // Show success feedback
    Alert.alert('Success', 'Expense added successfully!');
  };

  const deleteExpense = async (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
            setExpenses(updatedExpenses);
            await saveExpenses(updatedExpenses);
          },
        },
      ]
    );
  };

  const clearAllExpenses = async () => {
    Alert.alert(
      'Clear All Expenses',
      'Are you sure you want to delete all expenses? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setExpenses([]);
            await AsyncStorage.removeItem(STORAGE_KEY);
            Alert.alert('Success', 'All expenses cleared!');
          },
        },
      ]
    );
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryIcon = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName)?.icon || 'cash';
  };

  const getCategoryColor = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName)?.color || 'bg-gray-500';
  };

  const renderExpenseItem = (expense: Expense, index: number) => (
    <Animated.View
      key={expense.id}
      entering={SlideInRight.delay(index * 100).springify()}
      layout={Layout.springify()}
      className="mb-4"
    >
      <TouchableOpacity
        onLongPress={() => deleteExpense(expense.id)}
        activeOpacity={0.9}
      >
        <View
          className="bg-[#003030]/80 border border-[#58E886]/30 rounded-2xl p-4 shadow-lg"
          style={{
            shadowColor: '#003030',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Animated.View
                entering={ZoomIn.delay(index * 100 + 200)}
                className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${getCategoryColor(expense.category)}/90`}
              >
                <Ionicons
                  name={getCategoryIcon(expense.category) as any}
                  size={20}
                  color="#FFFFFF"
                />
              </Animated.View>
              
              <View className="flex-1">
                <Animated.View entering={FadeIn.delay(index * 100 + 300)}>
                  <Text className="text-[#E5E7EB] text-base font-semibold">
                    {expense.title}
                  </Text>
                  <Text className="text-[#6B7280] text-sm mt-1">
                    {expense.category} • {expense.date.toLocaleDateString()}
                  </Text>
                </Animated.View>
              </View>
            </View>
            
            <Animated.View entering={SlideInRight.delay(index * 100 + 400)}>
              <Text className="text-[#58E886] text-lg font-bold">
                ${expense.amount.toFixed(2)}
              </Text>
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderForm = () => (
    <Animated.View
      entering={FadeInDown.springify()}
      className="mb-6"
    >
      <View
        className="bg-[#001711]/60 border border-[#58E886]/40 rounded-3xl p-6 shadow-xl"
        style={{
          shadowColor: '#58E886',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        {/* Form Title */}
        <Animated.View entering={FadeIn.delay(200)}>
          <Text className="text-[#FFFFFF] text-xl font-bold mb-6 text-center">
            Add New Expense
          </Text>
        </Animated.View>

        {/* Expense Title Input */}
        <Animated.View entering={FadeInUp.delay(300)} className="mb-4">
          <Text className="text-[#E5E7EB] text-sm font-medium mb-2">
            Expense Title
          </Text>
          <TextInput
            className="bg-[#003030]/70 border border-[#58E886]/30 rounded-xl px-4 py-3 text-[#E5E7EB] text-base"
            placeholder="Enter expense title..."
            placeholderTextColor="#6B7280"
            value={title}
            onChangeText={setTitle}
            style={{
              shadowColor: '#003030',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          />
        </Animated.View>

        {/* Amount Input */}
        <Animated.View entering={FadeInUp.delay(400)} className="mb-4">
          <Text className="text-[#E5E7EB] text-sm font-medium mb-2">
            Amount
          </Text>
          <TextInput
            className="bg-[#003030]/70 border border-[#58E886]/30 rounded-xl px-4 py-3 text-[#E5E7EB] text-base"
            placeholder="0.00"
            placeholderTextColor="#6B7280"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={{
              shadowColor: '#003030',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          />
        </Animated.View>

        {/* Category Selection */}
        <Animated.View entering={FadeInUp.delay(500)} className="mb-6">
          <Text className="text-[#E5E7EB] text-sm font-medium mb-3">
            Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row space-x-3"
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.name}
                onPress={() => setSelectedCategory(category.name)}
                activeOpacity={0.8}
              >
                <Animated.View
                  entering={ZoomIn.delay(500 + index * 100)}
                  className={`items-center p-3 rounded-2xl min-w-[80px] ${
                    selectedCategory === category.name
                      ? 'bg-[#58E886]/90 border-2 border-[#58E886]'
                      : 'bg-[#003030]/60 border border-[#58E886]/20'
                  }`}
                  style={{
                    shadowColor: selectedCategory === category.name ? '#58E886' : '#003030',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: selectedCategory === category.name ? 0.4 : 0.2,
                    shadowRadius: 6,
                    elevation: selectedCategory === category.name ? 8 : 4,
                  }}
                >
                  <View className={`w-8 h-8 rounded-full items-center justify-center mb-2 ${category.color}/90`}>
                    <Ionicons
                      name={category.icon as any}
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text
                    className={`text-xs font-medium ${
                      selectedCategory === category.name
                        ? 'text-[#001711]'
                        : 'text-[#E5E7EB]'
                    }`}
                  >
                    {category.name}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.delay(800)} className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => setShowForm(false)}
            className="flex-1 bg-[#374151]/70 rounded-xl py-3 px-4"
            activeOpacity={0.8}
          >
            <Text className="text-[#9CA3AF] text-center font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={addExpense}
            className="flex-1 bg-[#58E886]/95 rounded-xl py-3 px-4 shadow-lg"
            activeOpacity={0.8}
            style={{
              shadowColor: '#58E886',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-[#001711] text-center font-bold">
              Add Expense
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );

  return (
    <Scaffold withBottomNav={true}>
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.springify()}
          className="mb-6"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-[#FFFFFF]">
              💰 Expenses
            </Text>
            <View className="flex-row space-x-2">
              {expenses.length > 0 && (
                <TouchableOpacity
                  onPress={clearAllExpenses}
                  className="bg-red-500/90 rounded-full w-12 h-12 items-center justify-center shadow-lg"
                  activeOpacity={0.8}
                  style={{
                    shadowColor: '#ef4444',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Ionicons name="trash" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                onPress={() => setShowForm(!showForm)}
                className="bg-[#58E886]/95 rounded-full w-12 h-12 items-center justify-center shadow-lg"
                activeOpacity={0.8}
                style={{
                  shadowColor: '#58E886',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Animated.View entering={ZoomIn.springify()}>
                  <Ionicons
                    name={showForm ? 'close' : 'add'}
                    size={24}
                    color="#001711"
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Total Amount */}
          <Animated.View
            entering={BounceIn.delay(300)}
            className="bg-[#58E886]/10 border border-[#58E886]/30 rounded-2xl p-4"
          >
            <Text className="text-[#6B7280] text-sm mb-1">Total Expenses</Text>
            <Text className="text-[#58E886] text-2xl font-bold">
              {isLoading ? 'Loading...' : `$${getTotalExpenses().toFixed(2)}`}
            </Text>
          </Animated.View>

          {/* Instructions */}
          {expenses.length > 0 && (
            <Animated.View
              entering={FadeIn.delay(500)}
              className="mt-3"
            >
              <Text className="text-[#6B7280] text-xs text-center">
                💡 Long press any expense to delete it
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Add Expense Form */}
        {showForm && renderForm()}

        {/* Expenses List */}
        <Animated.View entering={FadeInUp.delay(400)}>
          <Text className="text-[#E5E7EB] text-lg font-semibold mb-4">
            Recent Expenses
          </Text>
          {expenses.map((expense, index) => renderExpenseItem(expense, index))}
        </Animated.View>

        {expenses.length === 0 && !isLoading && (
          <Animated.View
            entering={FadeIn.delay(600)}
            className="items-center justify-center py-12"
          >
            <Text className="text-[#6B7280] text-center text-base">
              No expenses yet. Add your first expense above!
            </Text>
          </Animated.View>
        )}

        {isLoading && (
          <Animated.View
            entering={FadeIn}
            className="items-center justify-center py-12"
          >
            <Text className="text-[#58E886] text-center text-base">
              Loading your expenses...
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </Scaffold>
  );
} 