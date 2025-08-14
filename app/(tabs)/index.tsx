import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Drawer, PieChart, Scaffold } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useProfilePicture } from '../../hooks/useProfilePicture';
import { budgetService } from '../../services/supabaseService';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  type: 'expense' | 'income';
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

export default function Index() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const { avatarImage, refreshProfilePicture } = useProfilePicture();

  // Budget state variables
  const [dailyBudget, setDailyBudget] = useState(50);
  const [weeklyBudget, setWeeklyBudget] = useState(300);
  const [monthlyBudget, setMonthlyBudget] = useState(1200);

  // Get current month/year for filtering
  const now = new Date();
  const selectedMonth = now.getMonth();
  const selectedYear = now.getFullYear();

  // Function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  // Filtered expenses for current month/year
  const filteredExpenses = expenses.filter(exp =>
    exp.date.getMonth() === selectedMonth && exp.date.getFullYear() === selectedYear
  );


  useEffect(() => {
    loadExpenses();
    loadCategories();
    loadBudgets();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadExpenses();
      loadCategories();
      loadBudgets();
      refreshProfilePicture(); // Refresh profile picture when returning to screen
    }, [])
  );

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        const expensesWithDates = parsedExpenses.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
        }));
        setExpenses(expensesWithDates);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        const parsedCategories = JSON.parse(storedCategories);
        setCategories(parsedCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBudgets = async () => {
    try {
      if (!user) return;

      const { data, error } = await budgetService.getBudget();

      if (error && error.message !== 'No rows found') {
        throw error;
      }

      if (data) {
        setDailyBudget(data.daily_budget || 50);
        setWeeklyBudget(data.weekly_budget || 300);
        setMonthlyBudget(data.monthly_budget || 1200);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
      // Keep default values if loading fails
    }
  };

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

  const getCategoryExpenseData = () => {
    const categoryTotals: { [key: string]: number } = {};
    filteredExpenses
      .filter(expense => expense.type === 'expense')
      .forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });

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
      const color = tailwindColorToHex[category.color] || '#6b7280';

      return {
        percentage,
        color,
      };
    });
  };

  const renderBudgetBar = (title: string, spent: number, budget: number, color: string) => {
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const isOverBudget = spent > budget;

    return (

      <View className="mb-1">
        <View className="flex-row justify-between items-center">
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

  return (
    <>
      {/* Settings Drawer */}
      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {/* Drawer Header */}
        <View className="bg-[#58E886]/10 border-b border-[#58E886]/20 p-6">
         
          
          {/* User Info */}
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-[#58E886]/20 border-2 border-[#58E886] rounded-full items-center justify-center mr-3 overflow-hidden">
                <Image
                  source={avatarImage}
                  style={{ width: 40, height: 40 }}
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#58E886] font-semibold text-xl">
                  {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
                </Text>
                <Text className="text-[#D8DEE9]/70 text-sm">
                  {user?.email || 'No email set'}
                </Text>
              </View>
          </View>
        </View>

        {/* Drawer Content */}
        <View className="p-6 space-y-2">
          {/* Profile */}
          <TouchableOpacity 
            className="flex-row items-center py-4 px-3 rounded-2xl"
            onPress={() => {
              setDrawerVisible(false);
              router.push('/profile');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle" size={18} color="#58E886" />
            <Text className="text-[#58E886] font-medium text-base pl-2">Profile</Text>
          </TouchableOpacity>

          {/* Categories */}
          <TouchableOpacity 
            className="flex-row items-center py-4 px-3 rounded-2xl"
            onPress={() => {
              setDrawerVisible(false);
              router.push('/categories');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={18} color="#58E886" />
            <Text className="text-[#58E886] font-medium text-base pl-2">Categories</Text>
          </TouchableOpacity>

          {/* Budgets */}
          <TouchableOpacity 
            className="flex-row items-center py-4 px-3 rounded-2xl"
            onPress={() => {
              setDrawerVisible(false);
              router.push('/budget');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="cash" size={18} color="#58E886" />
            <Text className="text-[#58E886] font-medium text-base pl-2">Budgets</Text>
          </TouchableOpacity>
          
      
        </View>
      </Drawer>

      <Scaffold>
        <View className="flex-row bg-[#58E886]/10 items-center justify-between px-4 py-4">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-[#58E886]/20 border-2 border-[#58E886] rounded-full items-center justify-center mr-3 overflow-hidden">
              <Image
                source={avatarImage}
                style={{ width: 32, height: 32 }}
                resizeMode="cover"
              />
            </View>
            <Text className="text-[#58E886] text-lg font-bold flex-1" numberOfLines={1}>
              {getTimeBasedGreeting()}, {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            className="p-2 ml-2"
            activeOpacity={0.8}
          >
            <Ionicons name="menu" size={24} color="#58E886" />
          </TouchableOpacity>
        </View>
        <View className="flex-1" style={{ backgroundColor: 'rgba(0, 23, 17, 0.3)' }}>
          <ScrollView
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
          >
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              className="space-y-6"
            >
              {/* Card 1: Category Pie Chart */}
            {filteredExpenses.length > 0 && (
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
            )}

            {/* Card 2: Budget Comparison */}
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
              <Text className="text-[#58E886] text-lg font-bold mb-3 text-center">Budget Tracking</Text>

              {renderBudgetBar(
                "Daily Budget",
                getDailySpending(),
                dailyBudget,
                "bg-blue-500"
              )}

              {renderBudgetBar(
                "Weekly Budget",
                getWeeklySpending(),
                weeklyBudget,
                "bg-purple-500"
              )}

              {renderBudgetBar(
                "Monthly Budget",
                getMonthlySpending(),
                monthlyBudget,
                "bg-orange-500"
              )}
            </View>

            {/* Empty state when no expenses */}
            {filteredExpenses.length === 0 && !isLoading && (
              <View className="items-center justify-center py-12">
                <Ionicons name="wallet-outline" size={64} color="#58E886" style={{ opacity: 0.6 }} />
                <Text className="text-[#58E886]/60 text-center text-base mt-4">
                  No expenses yet this month.
                </Text>
                <Text className="text-[#58E886]/60 text-center text-sm mt-2">
                  Go to the Expenses tab to add your first transaction!
                </Text>
              </View>
            )}

            {isLoading && (
              <View className="items-center justify-center py-12">
                <Text className="text-[#58E886] text-center text-base">
                  Loading your dashboard...
                </Text>
              </View>
            )}
            </Animated.View>
          </ScrollView>
        </View>
      </Scaffold>
    </>
  );
}