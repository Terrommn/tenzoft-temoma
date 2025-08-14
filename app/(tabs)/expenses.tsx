import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInRight
} from 'react-native-reanimated';
import { PieChart, Scaffold, TransactionForm } from '../../components/ui';
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

  // Helper to get month name
  const getMonthName = (month: number) => {
    return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
  };

  // Filtered expenses for selected month/year
  const filteredExpenses = expenses.filter(exp =>
    exp.date.getMonth() === selectedMonth && exp.date.getFullYear() === selectedYear
  );

  // Save expenses to AsyncStorage
  const saveExpenses = React.useCallback(async (expensesToSave: Expense[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expensesToSave));
    } catch (error) {
      console.error('Error saving expenses:', error);
      Alert.alert('Error', 'Failed to save expenses to storage');
    }
  }, []);

  // Load expenses from AsyncStorage
  const loadExpenses = React.useCallback(async () => {
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
        // No default expenses - start with empty list
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      Alert.alert('Error', 'Failed to load expenses from storage');
    } finally {
      setIsLoading(false);
    }
  }, [saveExpenses]);

  const loadCategories = React.useCallback(async () => {
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
        // Ensure we have at least one expense category; UI handles selection
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
        // This is now handled in the TransactionForm component
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // Load expenses and categories on component mount
  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, [loadExpenses, loadCategories]);

  // Update selected category when transaction type changes
  useEffect(() => {
    const currentTypeCategories = categories.filter(cat => cat.type === 'expense');
    if (currentTypeCategories.length > 0) {
      // Set initial selected category if none exists
      if (!categories.find(cat => cat.name === 'Food')) {
        // This is now handled in the TransactionForm component
      }
    }
  }, [categories]);

  // Reload categories when screen comes into focus (e.g., returning from categories screen)
  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const addTransaction = async (newTransaction: Expense) => {
    const updatedExpenses = [newTransaction, ...expenses];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);

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


  const renderExpenseItem = (expense: Expense, index: number) => (
    <Animated.View
      key={expense.id}
      entering={SlideInRight.delay(index * 100)}
      className="mb-2"
    >
      <Swipeable
        renderRightActions={() => (
          <TouchableOpacity
            onPress={() => deleteExpense(expense.id)}
            activeOpacity={0.8}
            className="bg-red-500 rounded-full p-5 mr-4 my-2 items-center justify-center"
          >
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      >
        <TouchableOpacity
          onLongPress={() => deleteExpense(expense.id)}
          activeOpacity={0.9}
        >
          <View
            className={`bg-[#001711]/40 border-2 rounded-3xl p-5 mx-4 shadow-lg ${expense.type === 'expense'
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
      </Swipeable>
    </Animated.View>
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
        <Text style={styles.successText}>Transaction added!</Text>
      </Animated.View>
    </View>
  );

  return (
    <>
      {showSuccess && <CheckmarkAnimation />}
      <TransactionForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onAddTransaction={addTransaction}
        categories={categories}
        onManageCategories={handleManageCategories}
      />
      <Scaffold>


        <View className="flex-1" style={{ backgroundColor: 'rgba(0, 23, 17, 0.3)' }}>

          <Animated.View
            entering={FadeInDown.delay(100).springify()}
          >
            <View className="flex-row bg-[#58E886]/10  items-center justify-between px-4 py-2">
              <TouchableOpacity onPress={goToPrevMonth} className="p-2">
                <Ionicons name="chevron-back" size={22} color="#58E886" />
              </TouchableOpacity>
              <Text className="text-[#58E886] text-lg font-bold">
                {getMonthName(selectedMonth)} {selectedYear}
              </Text>
              <View className="flex-row items-center space-x-2">
               
                <TouchableOpacity onPress={goToNextMonth} className="p-2">
                  <Ionicons name="chevron-forward" size={22} color="#58E886" />
                </TouchableOpacity>
              </View>
            </View>

            {filteredExpenses.length > 0 && (
              <View className="w-screen ">
                <View
                  className="bg-[#58E886]/10 rounded-br-3xl  rounded-bl-3xl p-6"
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
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
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