import { Ionicons } from '@expo/vector-icons';
import { Sheet } from '@tamagui/sheet';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeInUp,
    ZoomIn
} from 'react-native-reanimated';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

interface TransactionFormProps {
  visible: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: any) => void;
  categories: Category[];
  onManageCategories: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  visible,
  onClose,
  onAddTransaction,
  categories,
  onManageCategories,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly' | 'annually'>('monthly');
  const [recurringDay, setRecurringDay] = useState(new Date().getDate());
  const [recurringWeekday, setRecurringWeekday] = useState(new Date().getDay());
  const [recurringMonth, setRecurringMonth] = useState(new Date().getMonth());

  // Update selected category when transaction type changes
  React.useEffect(() => {
    const currentTypeCategories = categories.filter(cat => cat.type === transactionType);
    if (currentTypeCategories.length > 0) {
      if (!selectedCategory || !currentTypeCategories.find(cat => cat.name === selectedCategory)) {
        setSelectedCategory(currentTypeCategories[0].name);
      }
    }
  }, [transactionType, categories, selectedCategory]);

  const handleAddTransaction = () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newTransaction = {
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

    onAddTransaction(newTransaction);

    // Reset form
    setTitle('');
    setAmount('');
    setTransactionType('expense');
    setIsRecurring(false);
    setRecurringFrequency('monthly');
    setRecurringDay(new Date().getDate());
    setRecurringWeekday(new Date().getDay());
    setRecurringMonth(new Date().getMonth());
  };

  return (
    <Sheet
      modal
      open={visible}
      onOpenChange={onClose}
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
                onPress={onClose}
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

              {/* Recurring Toggle */}
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
                    onPress={onManageCategories}
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
                onPress={onClose}
                className="flex-1 bg-[#374151]/60 border border-[#58E886]/20 rounded-2xl py-4"
                activeOpacity={0.8}
              >
                <Text className="text-[#9CA3AF] text-center text-lg font-bold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddTransaction}
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
}; 