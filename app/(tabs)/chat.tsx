import { Ionicons } from '@expo/vector-icons';
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
  Layout,
  SlideInLeft,
  SlideInRight,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  ZoomIn
} from 'react-native-reanimated';
import { Scaffold } from '../../components/ui';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatTab() {
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

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(userMessage.text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const getAIResponse = (userText: string): string => {
    const responses = [
      "That's an interesting question! Let me think about that for you.",
      "I understand what you're asking. Here's what I think...",
      "Great question! As Temoma AI, I'm here to help you with anything you need.",
      "I'm constantly learning and improving to better assist you.",
      "Thanks for chatting with me! Is there anything specific you'd like to know?",
      "I love talking with users like you. What else would you like to explore?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
            : SlideInLeft.delay(animationDelay).springify().damping(15).stiffness(100)
        }
        layout={Layout.springify().damping(15).stiffness(100)}
        className={`mb-6 ${isUser ? 'items-end' : 'items-start'}`}
      >
        {/* Message Bubble */}
        <Animated.View
          entering={
            isUser 
              ? ZoomIn.delay(animationDelay + 200).springify()
              : BounceIn.delay(animationDelay + 200).springify()
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
      exiting={FadeInUp.springify()}
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
    <Scaffold withBottomNav={true}>
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
            contentContainerStyle={{ paddingBottom: 0, paddingTop: 20 }}
          >
            {messages.map((message, index) => renderMessage(message, index))}
            {isTyping && <TypingIndicator />}
          </ScrollView>

          {/* Input Area */}
          <Animated.View
            entering={FadeInUp.springify()}
            className="px-4"
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