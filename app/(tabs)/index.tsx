import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PieChart, Scaffold } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

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

export default function HomeTab() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { signOut, user } = useAuth();
  
  // Budget state variables
  const [dailyBudget] = useState(50);
  const [weeklyBudget] = useState(300);
  const [monthlyBudget] = useState(1200);

  // Get current month/year for filtering
  const now = new Date();
  const selectedMonth = now.getMonth();
  const selectedYear = now.getFullYear();

  // Filtered expenses for current month/year
  const filteredExpenses = expenses.filter(exp =>
    exp.date.getMonth() === selectedMonth && exp.date.getFullYear() === selectedYear
  );

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadExpenses();
      loadCategories();
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

  return (
    <Scaffold>
      <View className="flex-1" style={{ backgroundColor: 'rgba(0, 23, 17, 0.3)' }}>
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        >
          {/* Sign Out Button */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-[#58E886] text-lg font-bold">Welcome back!</Text>
              <Text className="text-[#D8DEE9] text-sm">{user?.email || 'User'}</Text>
            </View>
            <TouchableOpacity
              className="bg-[#58E886]/20 px-4 py-2 rounded-full border border-[#58E886]/30"
              onPress={handleSignOut}
            >
              <Text className="text-[#58E886] font-medium">Sign Out</Text>
            </TouchableOpacity>
          </View>

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
                  minHeight: 380,
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
                minHeight: 380,
              }}
            >
              <Text className="text-[#58E886] text-lg font-bold mb-6 text-center">Budget Tracking</Text>
              
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
  );
} 