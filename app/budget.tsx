import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Scaffold } from '../components/ui/Scaffold';
import { useAuth } from '../contexts/AuthContext';
import { budgetService } from '../services/supabaseService';

// Memoized input component hoisted to module scope to preserve focus across parent re-renders
const BudgetInput = React.memo(({ label, value, onChangeText, placeholder, icon }: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: string;
}) => {
  const inputRef = React.useRef<TextInput>(null);

  return (
    <View className="mb-6">
      <Text className="text-[#58E886] mb-3 text-base font-semibold">{label}</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#58E8861A',
          borderWidth: 2,
          borderColor: '#58E8864D',
          borderRadius: 16,
          paddingHorizontal: 16,
          height: 40, // Adjusted height for icon and input
        }}>
        <View style={{ width: 32, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon as any} size={20} color="#58E886" />
        </View>
        <Text style={{ color: '#58E886', fontSize: 18, fontWeight: 'bold', width: 16, textAlign: 'center' }}>$
        </Text>
        <View style={{ flex: 1, marginLeft: 8, position: 'relative', justifyContent: 'center' }}>
          {(!value || value.length === 0) && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
              }}>
              <Text style={{ color: '#58E886aa', fontSize: 18, fontWeight: '600', lineHeight: 28 }}>
                {placeholder}
              </Text>
            </View>
          )}
          <TextInput
            ref={inputRef}
            
            style={{
              color: '#58E886',
              fontSize: 18,
              fontWeight: '600',
              height: 40, // Match parent row
              paddingVertical: 0,
              paddingHorizontal: 0,
              margin: 0,
              textAlignVertical: 'center',
              textAlign: 'left',
            }}

            value={value}
            onChangeText={(text) => {
              // Only allow numbers and decimal point
              const numericText = text.replace(/[^0-9.]/g, '');
              
              // Ensure only one decimal point
              const parts = numericText.split('.');
              const filteredText = parts.length > 2 
                ? parts[0] + '.' + parts.slice(1).join('')
                : numericText;
              
              onChangeText(filteredText);
            }}
            keyboardType="decimal-pad"
            placeholder=""
            underlineColorAndroid="transparent"
          />
        </View>
      </View>
    </View>

  );
});

export default function BudgetScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [dailyBudget, setDailyBudget] = useState('');
  const [weeklyBudget, setWeeklyBudget] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const handleDailyBudgetChange = React.useCallback((text: string) => {
    setDailyBudget(text);
  }, []);

  const handleWeeklyBudgetChange = React.useCallback((text: string) => {
    setWeeklyBudget(text);
  }, []);

  const handleMonthlyBudgetChange = React.useCallback((text: string) => {
    setMonthlyBudget(text);
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setInitialLoading(true);
      if (!user) return;

      const { data, error } = await budgetService.getBudget();

      if (error && error.message !== 'No rows found') {
        throw error;
      }

      if (data) {
        setDailyBudget(data.daily_budget?.toString() || '');
        setWeeklyBudget(data.weekly_budget?.toString() || '');
        setMonthlyBudget(data.monthly_budget?.toString() || '');
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      Alert.alert('Error', 'Failed to load budget settings');
    } finally {
      setInitialLoading(false);
    }
  };

  const saveBudgets = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const budgetData = {
        daily_budget: parseFloat(dailyBudget) || 0,
        weekly_budget: parseFloat(weeklyBudget) || 0,
        monthly_budget: parseFloat(monthlyBudget) || 0,
      };

      const { error } = await budgetService.upsertBudget(budgetData);

      if (error) throw error;

      Alert.alert('Success', 'Budget settings saved successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save budget settings');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Scaffold
        title="Budget Settings"
        showBack={true}
        onBack={() => router.back()}
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#58E886] text-lg">Loading budget settings...</Text>
        </View>
      </Scaffold>
    );
  }

  return (
    <Scaffold
      title="Budget Settings"
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
              Set Your Budget Limits
            </Text>
            <Text className="text-[#58E886]/70 text-center text-base">
              Configure your daily, weekly, and monthly spending limits
            </Text>
          </View>

          {/* Budget Inputs */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="space-y-4"
          >
            <BudgetInput
              label="Daily Budget"
              
              value={dailyBudget}
              onChangeText={handleDailyBudgetChange}
              placeholder="0.00"
              icon="calendar"
            />

            <BudgetInput
              label="Weekly Budget"
              value={weeklyBudget}
              onChangeText={handleWeeklyBudgetChange}
              placeholder="0.00"
              icon="calendar-outline"
            />

            <BudgetInput
              label="Monthly Budget"
              value={monthlyBudget}
              onChangeText={handleMonthlyBudgetChange}
              placeholder="0.00"
              icon="calendar-clear"
            />
          </Animated.View>

          {/* Save Button */}
          <Animated.View entering={FadeInUp.delay(400).springify()}>
            <TouchableOpacity
              onPress={saveBudgets}
              disabled={loading}
              className={`mt-8 rounded-2xl py-4 px-6 border-2 ${loading
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
                {loading ? (
                  <Ionicons name="reload" size={20} color="#001711" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="save" size={20} color="#001711" style={{ marginRight: 8 }} />
                )}
                <Text className="text-center text-[#001711] font-bold text-lg">
                  {loading ? 'Saving Budget...' : 'Save Budget Settings'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>


        </Animated.View>
      </ScrollView>
    </Scaffold>
  );
}
