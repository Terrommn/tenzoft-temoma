import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Sheet } from '@tamagui/sheet';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  ZoomIn
} from 'react-native-reanimated';
import { PieChart, Scaffold } from '../../components/ui';
import { useBottomNavHeight } from '../../hooks/useBottomNavHeight';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  type: 'expense' | 'income';
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'annually';
  recurringDay?: number; // Day of month for monthly recurring
  recurringWeekday?: number; // 0-6 (Sunday-Saturday) for weekly recurring
  recurringMonth?: number; // 0-11 for annually recurring
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

const STORAGE_KEY = '@temoma_expenses';
const CATEGORIES_STORAGE_KEY = '@temoma_categories';

export default function ExpensesTab() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly' | 'annually'>('monthly');
  const [recurringDay, setRecurringDay] = useState(new Date().getDate());
  const [recurringWeekday, setRecurringWeekday] = useState(new Date().getDay());
  const [recurringMonth, setRecurringMonth] = useState(new Date().getMonth());
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  // New state for month navigation
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  // Get bottom navigation height for FAB positioning
  const bottomNavHeight = useBottomNavHeight(true);
  
  // Budget state variables
  const [dailyBudget, setDailyBudget] = useState(50);
  const [weeklyBudget, setWeeklyBudget] = useState(300);
  const [monthlyBudget, setMonthlyBudget] = useState(1200);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Helper to get month name
  const getMonthName = (month: number) => {
    return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
  };

  // Filtered expenses for selected month/year
  const filteredExpenses = expenses.filter(exp =>
    exp.date.getMonth() === selectedMonth && exp.date.getFullYear() === selectedYear
  );

  // Load expenses from AsyncStorage on component mount
  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  // Update selected category when transaction type changes
  useEffect(() => {
    const currentTypeCategories = categories.filter(cat => cat.type === transactionType);
    if (currentTypeCategories.length > 0) {
      // If no category is selected or the current category doesn't match the transaction type
      if (!selectedCategory || !currentTypeCategories.find(cat => cat.name === selectedCategory)) {
        setSelectedCategory(currentTypeCategories[0].name);
      }
    }
  }, [transactionType, categories, selectedCategory]);

  // Reload categories when screen comes into focus (e.g., returning from categories screen)
  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );

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
            type: 'expense' as const,
          },
          {
            id: '2',
            title: 'Uber Ride',
            amount: 12.30,
            category: 'Transport',
            date: new Date(),
            type: 'expense' as const,
          },
          {
            id: '3',
            title: 'Salary',
            amount: 3500.00,
            category: 'Salary',
            date: new Date(),
            type: 'income' as const,
          },
          {
            id: '4',
            title: 'Freelance Work',
            amount: 450.00,
            category: 'Freelance',
            date: new Date(),
            type: 'income' as const,
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

  const loadCategories = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        const parsedCategories = JSON.parse(storedCategories);
        
        // Check if existing categories have the 'type' field, if not, migrate them
        const needsMigration = parsedCategories.some((cat: any) => !cat.type);
        if (needsMigration) {
          console.log('Migrating old category data...');
          // Clear old data and use default categories
          await AsyncStorage.removeItem(CATEGORIES_STORAGE_KEY);
          await loadCategories(); // Recursive call to load defaults
          return;
        }
        
        setCategories(parsedCategories);
        console.log('Categories loaded:', parsedCategories.length, 'categories');
        // Set initial selected category or update if current selection is invalid
        const currentTypeCategories = parsedCategories.filter((cat: Category) => cat.type === transactionType);
        if (currentTypeCategories.length > 0) {
          if (!selectedCategory || !currentTypeCategories.find((cat: Category) => cat.name === selectedCategory)) {
            setSelectedCategory(currentTypeCategories[0].name);
          }
        }
      } else {
        // Set default categories if no data exists
        const defaultCategories = [
          // Expense Categories
          { id: '1', name: 'Food', icon: 'restaurant', color: 'bg-orange-500', type: 'expense' as const },
          { id: '2', name: 'Transport', icon: 'car', color: 'bg-blue-500', type: 'expense' as const },
          { id: '3', name: 'Shopping', icon: 'bag', color: 'bg-purple-500', type: 'expense' as const },
          { id: '4', name: 'Bills', icon: 'receipt', color: 'bg-red-500', type: 'expense' as const },
          { id: '5', name: 'Entertainment', icon: 'game-controller', color: 'bg-pink-500', type: 'expense' as const },
          { id: '6', name: 'Health', icon: 'medical', color: 'bg-green-500', type: 'expense' as const },
          { id: '7', name: 'Groceries', icon: 'basket', color: 'bg-teal-500', type: 'expense' as const },
          { id: '8', name: 'Utilities', icon: 'flash', color: 'bg-yellow-500', type: 'expense' as const },
          // Income Categories
          { id: '9', name: 'Salary', icon: 'briefcase', color: 'bg-emerald-500', type: 'income' as const },
          { id: '10', name: 'Freelance', icon: 'laptop', color: 'bg-cyan-500', type: 'income' as const },
          { id: '11', name: 'Investment', icon: 'trending-up', color: 'bg-indigo-500', type: 'income' as const },
          { id: '12', name: 'Business', icon: 'business', color: 'bg-lime-500', type: 'income' as const },
          { id: '13', name: 'Side Hustle', icon: 'rocket', color: 'bg-pink-500', type: 'income' as const },
          { id: '14', name: 'Bonus', icon: 'gift', color: 'bg-purple-500', type: 'income' as const },
        ];
        setCategories(defaultCategories);
        await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(defaultCategories));
        console.log('Default categories created:', defaultCategories.length, 'categories');
        
        // Set initial selected category from default categories
        const currentTypeCategories = defaultCategories.filter(cat => cat.type === transactionType);
        if (currentTypeCategories.length > 0) {
          setSelectedCategory(currentTypeCategories[0].name);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const addTransaction = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newTransaction: Expense = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: parseFloat(amount),
      category: selectedCategory,
      date: new Date(),
      type: transactionType,
      isRecurring: isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      recurringDay: isRecurring && recurringFrequency === 'monthly' ? recurringDay : undefined,
      recurringWeekday: isRecurring && recurringFrequency === 'weekly' ? recurringWeekday : undefined,
      recurringMonth: isRecurring && recurringFrequency === 'annually' ? recurringMonth : undefined,
    };

    const updatedExpenses = [newTransaction, ...expenses];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);

    setTitle('');
    setAmount('');
    setTransactionType('expense');
    setIsRecurring(false);
    setRecurringFrequency('monthly');
    setRecurringDay(new Date().getDate());
    setRecurringWeekday(new Date().getDay());
    setRecurringMonth(new Date().getMonth());
    setShowForm(false);

    // Show animated checkmark
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1200);
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

  // Update getTotalExpenses and getTotalIncome to use filteredExpenses
  const getTotalExpenses = () => {
    return filteredExpenses
      .filter(expense => expense.type === 'expense')
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getTotalIncome = () => {
    return filteredExpenses
      .filter(expense => expense.type === 'income')
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getDailySpending = () => {
    const today = new Date();
    const todayExpenses = filteredExpenses.filter(expense => 
      expense.type === 'expense' && 
      expense.date.toDateString() === today.toDateString()
    );
    return todayExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getWeeklySpending = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekExpenses = filteredExpenses.filter(expense => 
      expense.type === 'expense' && 
      expense.date >= startOfWeek
    );
    return weekExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getMonthlySpending = () => {
    return getTotalExpenses();
  };

  const getCategoryIcon = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName)?.icon || 'help-circle';
  };

  const getCategoryColor = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName)?.color || 'bg-gray-500';
  };

  // Update getCategoryExpenseData to use filteredExpenses
  const getCategoryExpenseData = () => {
    const categoryTotals: { [key: string]: number } = {};
    filteredExpenses
      .filter(expense => expense.type === 'expense') // Only include expenses, not income
      .forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });

    // Convert Tailwind CSS classes to hex colors for the chart
    const tailwindColorToHex: { [key: string]: string } = {
      'bg-orange-500': '#f97316',
      'bg-blue-500': '#3b82f6',
      'bg-purple-500': '#a855f7',
      'bg-red-500': '#ef4444',
      'bg-pink-500': '#ec4899',
      'bg-green-500': '#22c55e',
      'bg-yellow-500': '#eab308',
      'bg-indigo-500': '#6366f1',
      'bg-teal-500': '#14b8a6',
      'bg-cyan-500': '#06b6d4',
      'bg-lime-500': '#84cc16',
      'bg-emerald-500': '#10b981',
      'bg-gray-500': '#6b7280',
    };

    const totalExpenses = getTotalExpenses();

    return categories.map(category => {
      const total = categoryTotals[category.name] || 0;
      const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
      const color = tailwindColorToHex[category.color] || '#6b7280'; // Default to gray if not found

      return {
        percentage,
        color,
      };
    });
  };

  // Month navigation handlers
  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleManageCategories = () => {
    setShowForm(false);
    router.push('/categories');
  };

  const renderBudgetBar = (title: string, spent: number, budget: number, color: string) => {
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const isOverBudget = spent > budget;
    
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-[#58E886] text-base font-bold">{title}</Text>
          <Text className="text-[#58E886]/70 text-sm">
            ${spent.toFixed(2)} / ${budget.toFixed(2)}
          </Text>
        </View>
        <View className="bg-[#002a20]/30 rounded-full h-4 border border-[#58E886]/20">
          <View 
            className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : color}`}
            style={{ width: `${percentage}%` }}
          />
        </View>
        <Text className={`text-xs mt-1 ${isOverBudget ? 'text-red-400' : 'text-[#58E886]/70'}`}>
          {isOverBudget ? `Over budget by $${(spent - budget).toFixed(2)}` : `${(100 - percentage).toFixed(0)}% remaining`}
        </Text>
      </View>
    );
  };

  const renderExpenseItem = (expense: Expense, index: number) => (
    <Animated.View
      key={expense.id}
      entering={SlideInRight.delay(index * 100)}
      className="mb-2"
    >
      <TouchableOpacity
        onLongPress={() => deleteExpense(expense.id)}
        activeOpacity={0.9}
      >
        <View
          className={`bg-[#001711]/40 border-2 rounded-3xl p-5 shadow-lg ${expense.type === 'expense'
              ? 'border-red-500/20'
              : 'border-green-500/20'
            }`}
          style={{
            shadowColor: expense.type === 'expense' ? '#ef4444' : '#22c55e',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View
                className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${getCategoryColor(expense.category)}`}
                style={{
                  shadowColor: expense.type === 'expense' ? '#58E886' : '#22c55e',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 6,
                }}
              >
                <Ionicons
                  name={getCategoryIcon(expense.category) as any}
                  size={24}
                  color="#FFFFFF"
                />
              </View>

              <View className="flex-1">
                <View>
                  <Text className="text-[#FFFFFF] text-base font-bold">
                    {expense.title}
                  </Text>
                  <Text className="text-[#58E886]/70 text-sm mt-1">
                    {expense.type === 'expense' ? expense.category : 'Income'} • {expense.date.toLocaleDateString()}
                    
                  </Text>
                </View>
              </View>
            </View>

            <View >
              <Text className="text-lg font-bold text-white">
                {expense.type === 'expense' ? '-' : '+'}${expense.amount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderForm = () => (
    <Sheet
      modal
      open={showForm}
      onOpenChange={setShowForm}
      snapPoints={[95]}
      dismissOnSnapToBottom
      position={0}
      zIndex={100000}
      animation="medium"
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0, 0, 0, 0.3)"
      />
      <Sheet.Frame className="bg-gradient-to-b from-[#001711] to-[#002817] rounded-t-3xl border-t-2 border-[#58E886]/30">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 p-6">
            {/* Handle Bar */}
            <View className="w-12 h-1 bg-[#58E886]/30 rounded-full self-center mb-6" />
            
            {/* Header */}
            <Animated.View
              entering={FadeInUp.delay(100)}
              className="flex-row items-center justify-between mb-8"
            >
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                className="w-12 h-12 rounded-2xl bg-[#58E886]/10 border border-[#58E886]/20 items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#58E886" />
              </TouchableOpacity>

              <Text className="text-white text-2xl font-bold tracking-wide">
                Add Transaction
              </Text>

              <View className="w-12" />
            </Animated.View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Transaction Type Selector */}
              <Animated.View entering={FadeInUp.delay(200)} className="mb-8">
                <Text className="text-[#58E886] text-base font-bold mb-4 tracking-wide">
                  TYPE
                </Text>
                <View className="flex-row bg-[#002a20]/50 rounded-3xl p-2 border border-[#58E886]/20">
                  
                  <TouchableOpacity
                    onPress={() => setTransactionType('expense')}
                    className={`flex-1 py-4 px-6 rounded-2xl flex-row items-center justify-center ${
                      transactionType === 'expense'
                        ? 'bg-red-500/20 border border-red-500/40'
                        : 'bg-transparent'
                        
                    }`}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="remove-circle" 
                      size={20} 
                      color={transactionType === 'expense' ? '#ef4444' : '#58E886'} 
                    />
                    <Text className={`ml-2 font-bold ${
                      transactionType === 'expense' ? 'text-red-400' : 'text-[#58E886]'
                    }`}>
                      Expense
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => setTransactionType('income')}
                    className={`flex-1 py-4 px-6 rounded-2xl flex-row items-center justify-center ${
                      transactionType === 'income'
                        ? 'bg-light-green/20 border border-light-green'
                        : 'bg-transparent'
                    }`}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="add-circle" 
                      size={20} 
                      color={transactionType === 'income' ? '#22c55e' : '#58E886'} 
                    />
                    <Text className={`ml-2 font-bold ${
                      transactionType === 'income' ? 'text-light-green' : 'text-[#58E886]'
                    }`}>
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Title and Amount Row */}
              <Animated.View entering={FadeInUp.delay(300)} className="mb-8">
                <Text className="text-[#58E886] text-base font-bold mb-4 tracking-wide">
                  DETAILS
                </Text>
                <View className="space-y-4">
                  <View className="bg-[#002a20]/30 border border-[#58E886]/20 rounded-2xl p-1">
                    <TextInput
                      className="px-5 py-4 text-white text-lg font-medium"
                      placeholder={`What did you ${transactionType === 'expense' ? 'spend on' : 'earn from'}?`}
                      placeholderTextColor="#58E886"
                      value={title}
                      onChangeText={setTitle}
                      autoCapitalize="words"
                    />
                  </View>
                  <View className="bg-[#002a20]/30 border border-[#58E886]/20 rounded-2xl p-1 flex-row items-center">
                    <Text className="text-3xl font-bold text-[#58E886] pl-5">$</Text>
                    <TextInput
                      className="flex-1 px-2 py-4 text-white text-lg font-medium"
                      placeholder="0.00"
                      placeholderTextColor="#58E886"
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </Animated.View>

              {/* Recurring Toggle (Income Only) */}
                <Animated.View entering={FadeInUp.delay(400)} className="mb-8">
                  <TouchableOpacity
                    onPress={() => setIsRecurring(!isRecurring)}
                    className={`bg-[#002a20]/30 border rounded-2xl p-5 flex-row items-center justify-between ${
                      isRecurring ? 'border-[#58E886]/60' : 'border-[#58E886]/20'
                    }`}
                    activeOpacity={0.8}
                  >
                    <View className="flex-1">
                      <Text className="text-white text-lg font-bold">Recurring Transaction</Text>
                      <Text className="text-[#58E886]/70 text-sm mt-1">
                        {isRecurring ? 'Will repeat automatically' : 'One-time transaction'}
                      </Text>
                    </View>
                    <View className={`w-14 h-8 rounded-full p-1 ${isRecurring ? 'bg-[#58E886]' : 'bg-[#374151]'}`}>
                      <View className={`w-6 h-6 rounded-full bg-white transition-transform ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>

              {/* Recurring Frequency Selector - Only show when recurring is ON */}
              {isRecurring && (
                <Animated.View entering={FadeInUp.delay(450)} className="mb-8">
                  <Text className="text-[#58E886] text-base font-bold mb-4 tracking-wide">
                    FREQUENCY
                  </Text>
                  <View className="flex-row bg-[#002a20]/50 rounded-3xl p-2 border border-[#58E886]/20">
                    <TouchableOpacity
                      onPress={() => setRecurringFrequency('weekly')}
                      className={`flex-1 py-3 px-4 rounded-2xl items-center ${
                        recurringFrequency === 'weekly'
                          ? 'bg-[#58E886]/20 border border-[#58E886]/40'
                          : 'bg-transparent'
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`font-bold text-sm ${
                        recurringFrequency === 'weekly' ? 'text-[#58E886]' : 'text-[#58E886]/70'
                      }`}>
                        Weekly
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => setRecurringFrequency('monthly')}
                      className={`flex-1 py-3 px-4 rounded-2xl items-center ${
                        recurringFrequency === 'monthly'
                          ? 'bg-[#58E886]/20 border border-[#58E886]/40'
                          : 'bg-transparent'
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`font-bold text-sm ${
                        recurringFrequency === 'monthly' ? 'text-[#58E886]' : 'text-[#58E886]/70'
                      }`}>
                        Monthly
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => setRecurringFrequency('annually')}
                      className={`flex-1 py-3 px-4 rounded-2xl items-center ${
                        recurringFrequency === 'annually'
                          ? 'bg-[#58E886]/20 border border-[#58E886]/40'
                          : 'bg-transparent'
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`font-bold text-sm ${
                        recurringFrequency === 'annually' ? 'text-[#58E886]' : 'text-[#58E886]/70'
                      }`}>
                        Annually
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}

              {/* Monthly Day Selector - Only show when recurring is ON AND frequency is monthly */}
              {isRecurring && recurringFrequency === 'monthly' && (
                <Animated.View entering={FadeInUp.delay(500)} className="mb-8">
                  <Text className="text-[#58E886] text-base font-bold mb-4 tracking-wide">
                    DAY OF MONTH
                  </Text>
                  <View className="bg-[#002a20]/30 border border-[#58E886]/20 rounded-2xl p-4">
                    <View className="flex-row flex-wrap justify-between">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <TouchableOpacity
                          key={day}
                          onPress={() => setRecurringDay(day)}
                          className={`w-12 h-12 rounded-xl items-center justify-center mb-2 ${
                            recurringDay === day
                              ? 'bg-[#58E886] border border-[#58E886]'
                              : 'bg-[#001711]/40 border border-[#58E886]/20'
                          }`}
                          activeOpacity={0.8}
                        >
                          <Text className={`font-bold text-sm ${
                            recurringDay === day ? 'text-[#001711]' : 'text-[#58E886]'
                          }`}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <Text className="text-[#58E886]/50 text-xs mt-2 text-center">
                    Select the day of the month
                  </Text>
                </Animated.View>
              )}

              {/* Weekly Day Selector - Only show when recurring is ON AND frequency is weekly */}
              {isRecurring && recurringFrequency === 'weekly' && (
                <Animated.View entering={FadeInUp.delay(500)} className="mb-8">
                  <Text className="text-[#58E886] text-base font-bold mb-4 tracking-wide">
                    DAY OF WEEK
                  </Text>
                  <View className="bg-[#002a20]/30 border border-[#58E886]/20 rounded-2xl p-4">
                    <View className="flex-row flex-wrap justify-between">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setRecurringWeekday(index)}
                          className={`flex-1 h-12 rounded-xl items-center justify-center mx-1 ${
                            recurringWeekday === index
                              ? 'bg-[#58E886] border border-[#58E886]'
                              : 'bg-[#001711]/40 border border-[#58E886]/20'
                          }`}
                          activeOpacity={0.8}
                        >
                          <Text className={`font-bold text-sm ${
                            recurringWeekday === index ? 'text-[#001711]' : 'text-[#58E886]'
                          }`}>
                            {dayName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <Text className="text-[#58E886]/50 text-xs mt-2 text-center">
                    Select the day of the week
                  </Text>
                </Animated.View>
              )}

              {/* Annual Date Selector - Only show when recurring is ON AND frequency is annually */}
              {isRecurring && recurringFrequency === 'annually' && (
                <Animated.View entering={FadeInUp.delay(500)} className="mb-8">
                  <Text className="text-[#58E886] text-base font-bold mb-4 tracking-wide">
                    ANNUAL DATE
                  </Text>
                  
                  {/* Month Selector */}
                  <Text className="text-[#58E886]/70 text-sm mb-2">Month</Text>
                  <View className="bg-[#002a20]/30 border border-[#58E886]/20 rounded-2xl p-3 mb-4">
                    <View className="flex-row flex-wrap justify-between">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((monthName, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setRecurringMonth(index)}
                          className={`w-16 h-10 rounded-xl items-center justify-center mb-2 ${
                            recurringMonth === index
                              ? 'bg-[#58E886] border border-[#58E886]'
                              : 'bg-[#001711]/40 border border-[#58E886]/20'
                          }`}
                          activeOpacity={0.8}
                        >
                          <Text className={`font-bold text-xs ${
                            recurringMonth === index ? 'text-[#001711]' : 'text-[#58E886]'
                          }`}>
                            {monthName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Day Selector */}
                  <Text className="text-[#58E886]/70 text-sm mb-2">Day</Text>
                  <View className="bg-[#002a20]/30 border border-[#58E886]/20 rounded-2xl p-4">
                    <View className="flex-row flex-wrap justify-between">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <TouchableOpacity
                          key={day}
                          onPress={() => setRecurringDay(day)}
                          className={`w-12 h-12 rounded-xl items-center justify-center mb-2 ${
                            recurringDay === day
                              ? 'bg-[#58E886] border border-[#58E886]'
                              : 'bg-[#001711]/40 border border-[#58E886]/20'
                          }`}
                          activeOpacity={0.8}
                        >
                          <Text className={`font-bold text-sm ${
                            recurringDay === day ? 'text-[#001711]' : 'text-[#58E886]'
                          }`}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <Text className="text-[#58E886]/50 text-xs mt-2 text-center">
                    Select the month and day of the year
                  </Text>
                </Animated.View>
              )}

              {/* Category Selection */}
              <Animated.View entering={FadeInUp.delay(600)} className="mb-4">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-[#58E886] text-base font-bold tracking-wide">
                    CATEGORY
                  </Text>
                  <TouchableOpacity
                    onPress={handleManageCategories}
                    className="flex-row items-center bg-[#58E886]/10 px-3 py-2 rounded-xl border border-[#58E886]/20"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="settings-outline" size={16} color="#58E886" />
                    <Text className="text-[#58E886] text-xs font-semibold ml-1">Manage</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Single Scrollable Row */}
                <ScrollView 
                  horizontal
                  contentContainerStyle={{ paddingHorizontal: 2 }}
                  className="mb-4"
                >
                  {categories.filter(category => category.type === transactionType).map((category, index) => (
                    <TouchableOpacity
                      key={category.name}
                      onPress={() => setSelectedCategory(category.name)}
                      activeOpacity={0.8}
                      className="mr-3"
                      style={{ width: 100 }}
                    >
                      <Animated.View
                        entering={ZoomIn.delay(500 + index * 50)}
                        className={`items-center p-3 rounded-2xl border-2 ${
                          selectedCategory === category.name
                            ? 'bg-[#58E886]/20 border-[#58E886]'
                            : 'bg-[#002a20]/30 border-[#58E886]/20'
                        }`}
                      >
                        <View className={`w-9 h-9 rounded-xl items-center justify-center mb-2 ${category.color}`}>
                          <Ionicons
                            name={category.icon as any}
                            size={18}
                            color="#FFFFFF"
                          />
                        </View>
                        <Text
                          className={`text-center font-bold text-xs ${
                            selectedCategory === category.name ? 'text-[#58E886]' : 'text-white'
                          }`}
                          numberOfLines={1}
                        >
                          {category.name}
                        </Text>
                      </Animated.View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            </ScrollView>

            {/* Action Buttons */}
            <Animated.View entering={FadeInUp.delay(800)} className="flex-row space-x-4 pt-4">
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                className="flex-1 bg-[#374151]/60 border border-[#58E886]/20 rounded-2xl py-4"
                activeOpacity={0.8}
              >
                <Text className="text-[#9CA3AF] text-center text-lg font-bold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={addTransaction}
                className={`flex-1 rounded-2xl py-4 ${
                  transactionType === 'expense' 
                    ? 'bg-red-500 shadow-red-500/50' 
                    : 'bg-light-green shadow-light-green-50'
                }`}
                activeOpacity={0.8}
                style={{
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
               


                <Text className="text-white text-center text-lg font-bold">
                  Add {transactionType === 'expense' ? 'Expense' : 'Income'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </Sheet.Frame>
    </Sheet>
  );

  // Animated checkmark component
  const CheckmarkAnimation = () => (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(400)}
        style={styles.checkmarkContainer}
      >
        <View style={styles.circle}>
          <Ionicons name="checkmark" size={56} color="#fff" />
        </View>
        <Text style={styles.successText}>{transactionType === 'expense' ? 'Expense' : 'Income'} added!</Text>
      </Animated.View>
    </View>
  );

  return (
    <>
      {showSuccess && <CheckmarkAnimation />}
      {renderForm()}
      <Scaffold>
          <View className="flex-row items-center justify-center space-x-4">
            <TouchableOpacity onPress={goToPrevMonth} className="p-2">
              <Ionicons name="chevron-back" size={22} color="#58E886" />
            </TouchableOpacity>
            <Text className="text-[#58E886] text-lg font-bold">
              {getMonthName(selectedMonth)} {selectedYear}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} className="p-2">
              <Ionicons name="chevron-forward" size={22} color="#58E886" />
            </TouchableOpacity>
          </View>

        <View className="flex-1" style={{ backgroundColor: 'rgba(0, 23, 17, 0.3)' }}>

          <Animated.View
            entering={FadeInDown.delay(100).springify()}
          >
            
              {filteredExpenses.length > 0 && (
                <View className="w-screen px-4 pt-2">
                  <View 
                    className="bg-[#58E886]/10 border-2 border-[#58E886]/30 rounded-3xl p-6"
                    style={{
                      shadowColor: '#58E886',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 12,
                      elevation: 8,
                    }}
                  >
                    <Text className="text-[#58E886] text-lg font-bold mb-4 text-center">Category Breakdown</Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 items-center">
                        <PieChart
                          data={getCategoryExpenseData()}
                          size={140}
                          innerRadius={45}
                        />
                      </View>
                      <View className="flex-1 ml-4">
                        <View className="flex-col">
                          {categories.map(category => {
                            const totalForCategory = filteredExpenses
                              .filter(exp => exp.type === 'expense' && exp.category === category.name)
                              .reduce((sum, exp) => sum + exp.amount, 0);
                            if (totalForCategory === 0) return null;

                            const categoryPercentage = (totalForCategory / getTotalExpenses()) * 100;

                            return (
                              <View key={category.name} className="flex-row items-center mb-3">
                                <View className={`w-4 h-4 rounded-full ${category.color} mr-2`} />
                                <Text className="text-[#58E886] text-sm font-semibold">{category.name} ({categoryPercentage.toFixed(0)}%)</Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                    
                    {/* Total Income and Expenses */}
                    <View className="mt-6 pt-4 border-t border-[#58E886]/20">
                      <View className='flex-row items-center justify-around'>
                        <View className='flex-1 items-center justify-center'>
                          <Text className="text-[#58E886]/70 text-sm font-semibold mb-2">Income</Text>
                          <Text className="text-[#58E886] text-2xl font-bold">
                            {isLoading ? 'Loading...' : `$${getTotalIncome().toFixed(2)}`}
                          </Text>
                        </View>
                        <View className='flex-1 items-center justify-center'>
                          <Text className="text-[#58E886]/70 text-sm font-semibold mb-2">Expenses</Text>
                          <Text className="text-[#58E886] text-2xl font-bold">
                            {isLoading ? 'Loading...' : `$${getTotalExpenses().toFixed(2)}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              
          </Animated.View>

          <ScrollView
            className="flex-1 px-8"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingTop: activeCardIndex === 0 ? 10 : 20, 
              paddingBottom: 100 
            }}
            style={{ backgroundColor: 'transparent' }}
          >
            {/* Expenses List */}

            {filteredExpenses.map((expense, index) => renderExpenseItem(expense, index))}

            {filteredExpenses.length === 0 && !isLoading && (
              <Animated.View
                entering={FadeIn}
                className="items-center justify-center py-12"
              >
                <Text className="text-[#58E886]/60 text-center text-base">
                  No expenses yet for this month. Add your first expense using the button below!
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
        </View>
      </Scaffold>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowForm(!showForm)}
        className="absolute bg-[#58E886] rounded-full w-14 h-14 items-center justify-center"
        activeOpacity={0.8}
        style={{
          bottom: bottomNavHeight + 20,
          right: 20,
          shadowColor: '#58E886',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 16,
        }}
      >
        <Ionicons
          name={showForm ? 'close' : 'add'}
          size={28}
          color="#001711"
        />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  successText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: '#22c55e',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});