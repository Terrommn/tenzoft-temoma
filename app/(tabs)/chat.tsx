import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    BounceIn,
    FadeIn,
    FadeInUp,
    FadeOutUp,
    Layout,
    SlideInLeft,
    SlideInRight,
    SlideInUp,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    ZoomIn
} from 'react-native-reanimated';
import { Scaffold } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { getGeminiResponse } from '../../services/geminiService';
import { Expense, expenseService } from '../../services/supabaseService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatTab() {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Temoma AI. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputScale = useSharedValue(1);

  const { user } = useAuth();
  const [monthlyExpenses, setMonthlyExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);

  const loadMonthlyExpenses = async () => {
    if (!user) return;
    setExpensesLoading(true);
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await expenseService.getExpensesByDateRange(startOfMonth, endOfMonth);
    if (error) {
      console.error("Error loading monthly expenses:", error);
      setMonthlyExpenses([]);
    } else {
      setMonthlyExpenses(data || []);
    }
    setExpensesLoading(false);
  };

  React.useEffect(() => {
    loadMonthlyExpenses();
  }, [user]);

  // Reload expenses when the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadMonthlyExpenses();
    }, [user]) // Depend on user to refetch if user changes
  );

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    Keyboard.dismiss();
    inputScale.value = withSpring(0.95, { duration: 100 }, () => {
      inputScale.value = withSpring(1, { duration: 100 });
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Get AI response from Gemini
      const aiResponseText = await getGeminiResponse(userMessage.text);
      // Begin typing indicator exit before showing AI message for smoother flow
      setIsTyping(false);
      await sleep(180);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error:', error);
      // Hide typing indicator first even on error
      setIsTyping(false);
      await sleep(180);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, tuve un problema al procesar tu pregunta. ¿Podrías intentarlo de nuevo?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // no-op; typing indicator handled above to control timing
    }
  };



  const renderMessage = (message: Message, index: number) => {
    const isUser = message.isUser;
    const animationDelay = index * 100;
    
    return (
      <Animated.View
        key={message.id}
        entering={
          isUser 
            ? SlideInRight.delay(animationDelay).springify().damping(15).stiffness(100)
            : SlideInUp.delay(animationDelay).duration(250)
        }
        layout={Layout.springify().damping(15).stiffness(100)}
        className={`mb-6 ${isUser ? 'items-end' : 'items-start'}`}
      >
        {/* Message Bubble */}
        <Animated.View
          entering={
            isUser 
              ? ZoomIn.delay(animationDelay + 200).springify()
              : FadeInUp.delay(animationDelay + 200).duration(220)
          }
          className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
            isUser
              ? 'bg-[#58E886]/95 shadow-[#58E886]/30 rounded-br-md'
              : 'bg-[#003030]/85 border border-[#58E886]/40 shadow-[#003030]/50 rounded-bl-md'
          }`}
          style={{
            shadowOffset: { width: 0, height: isUser ? 6 : 8 },
            shadowOpacity: isUser ? 0.4 : 0.5,
            shadowRadius: isUser ? 10 : 12,
            elevation: isUser ? 10 : 12,
          }}
        >
          <Animated.View
            entering={FadeIn.delay(animationDelay + 400)}
          >
            <Text
              className={`text-base leading-7 ${
                isUser ? 'text-[#001711] font-semibold' : 'text-[#E5E7EB] font-medium'
              }`}
            >
              {message.text}
            </Text>
          </Animated.View>
        </Animated.View>
        
        {/* Timestamp */}
        <Animated.View
          entering={FadeIn.delay(animationDelay + 600)}
          className={`mt-2 px-4 ${isUser ? 'items-end' : 'items-start'}`}
        >
          <Text className="text-xs text-[#6B7280]/70 font-mono">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Animated.View>


      </Animated.View>
    );
  };
  

  const TypingIndicator = () => (
    <Animated.View
      entering={SlideInLeft.springify().damping(15)}
      exiting={FadeOutUp.duration(180)}
      className="items-start mb-6"
    >
      {/* Typing Bubble */}
      <Animated.View
        entering={BounceIn.delay(200)}
      >
        <View
          className="bg-[#003030]/85 border border-[#58E886]/40 rounded-2xl rounded-bl-md p-4 shadow-lg"
          style={{
            shadowColor: '#003030',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <View className="flex-row space-x-2 items-center">
            {[0, 1, 2].map((dot) => (
              <Animated.View
                key={dot}
                className="w-2.5 h-2.5 bg-[#58E886] rounded-full"
                entering={FadeIn.delay(dot * 300)}
                style={{
                  opacity: withRepeat(
                    withSequence(
                      withDelay(dot * 400, withSpring(0.3)),
                      withDelay(dot * 400, withSpring(1)),
                      withDelay(dot * 400, withSpring(0.3))
                    ),
                    -1,
                    true
                  ),
                }}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );

  return (
          <Scaffold avoidBottomNav={true}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View className="flex-1">
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 20 }}
          >
            {messages.map((message, index) => renderMessage(message, index))}
            {isTyping && <TypingIndicator />}
          </ScrollView>

          {/* Input Area */}
          <Animated.View
            entering={FadeInUp.springify()}
            className="px-4 pb-4"
          >
            <View
              className="bg-[#003030]/70 border border-[#58E886]/40 rounded-3xl p-3 shadow-xl"
              style={{
                shadowColor: '#58E886',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              <View className="flex-row items-end space-x-3">
                <TextInput
                  className="flex-1 text-[#E5E7EB] text-base px-4 py-3 min-h-[44px] max-h-[120px]"
                  placeholder="Message Temoma AI..."
                  placeholderTextColor="#6B7280"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  style={{
                    textAlignVertical: 'center',
                  }}
                />
                
                <TouchableOpacity
                  className={`w-11 h-11 rounded-full items-center justify-center shadow-lg ${
                    inputText.trim() 
                      ? 'bg-[#58E886]/95' 
                      : 'bg-[#374151]/70'
                  }`}
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isTyping}
                  activeOpacity={0.8}
                  style={{
                    shadowColor: inputText.trim() ? '#58E886' : '#374151',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: inputText.trim() ? 0.4 : 0.2,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={inputText.trim() ? '#001711' : '#9CA3AF'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Scaffold>
  );
} 