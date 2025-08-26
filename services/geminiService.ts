import { GoogleGenerativeAI } from "@google/generative-ai";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { expenseService } from './supabaseService';

// Debug: Check if API key is being loaded
console.log('API Key available:', !!process.env.EXPO_PUBLIC_GEMINI_API_KEY);
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Gemini API key not found in environment variables');
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getCurrentMonthExpenses() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { data, error } = await expenseService.getExpensesByDateRange(startOfMonth, endOfMonth);
  // If Supabase returns data, normalize and return
  if (!error && data && data.length > 0) {
    return data.map((exp: any) => ({
      ...exp,
      amount: Number(exp.amount) || 0,
      date: new Date(exp.date).toISOString(),
    }));
  }

  // Fallback: read from local AsyncStorage used by the app dashboard
  try {
    const STORAGE_KEY = '@temoma_expenses';
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const month = today.getMonth();
    const year = today.getFullYear();
    // Normalize structure
    const normalized = parsed.map((exp: any) => ({
      ...exp,
      amount: Number(exp.amount) || 0,
      date: new Date(exp.date),
    }));
    // Filter to current month
    const filtered = normalized.filter((exp: any) => {
      const d = new Date(exp.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    return filtered;
  } catch (fallbackErr) {
    console.error('Fallback local expenses error:', fallbackErr);
    return [];
  }
}

type FinanceRecord = {
  id?: string;
  user_id?: string;
  amount: number;
  description?: string;
  category: string;
  date: string | Date;
  type: 'income' | 'expense';
};

export async function getGeminiResponse(userText: string) {
  // Always re-fetch fresh values right before constructing the prompt
  const expenses: FinanceRecord[] = await getCurrentMonthExpenses();
  try {
    // Recompute all aggregates from the freshly fetched values
    // Separate incomes and expenses
    const incomes: FinanceRecord[] = expenses.filter((exp: FinanceRecord) => exp.type === 'income');
    const expensesOnly: FinanceRecord[] = expenses.filter((exp: FinanceRecord) => exp.type === 'expense');

    // Calcular totales
    const totalIncome = incomes.reduce((sum: number, inc: FinanceRecord) => sum + inc.amount, 0);
    const totalExpenses = expensesOnly.reduce((sum: number, exp: FinanceRecord) => sum + exp.amount, 0);

    // Agrupar por categoría
    const expensesByCategory = expensesOnly.reduce((acc: Record<string, number>, exp: FinanceRecord) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    // Create summaries
    const incomeSummary = incomes
      .map((inc: FinanceRecord) => `- ${inc.category}: $${inc.amount} (${new Date(inc.date).toLocaleDateString()})`)
      .join('\n');

    const expensesSummary = expensesOnly
      .map((exp: FinanceRecord) => `- ${exp.category}: $${exp.amount} (${new Date(exp.date).toLocaleDateString()})`)
      .join('\n');

    const categoryAnalysis = Object.entries(expensesByCategory)
      .map(([category, amount]) => `- ${category}: $${amount}`)
      .join('\n');

    // Build prompt with up-to-date values
    const prompt = `
      Act as Temoma AI, an expert financial assistant.
      Analyze the following monthly financial data and respond to the user's question.
      
      User's question: "${userText}"

      MONTHLY FINANCIAL SUMMARY:
      -------------------------
      Total Income: $${totalIncome}
      Total Expenses: $${totalExpenses}
      Balance: $${totalIncome - totalExpenses}

      INCOME BREAKDOWN:
      -------------------------
      ${incomeSummary || "No income recorded this month."}

      EXPENSES BY CATEGORY:
      -------------------------
      ${categoryAnalysis || "No expenses recorded this month."}

      DETAILED EXPENSES:
      -------------------------
      ${expensesSummary || "No detailed expenses to show."}

      Instructions:
      1. Respond in a concise and friendly manner in English
      2. Provide specific analysis using exact numbers
      3. If you detect concerning spending patterns, mention them
      4. If the question is not finance-related, suggest the user ask about their income, expenses, or budget
      5. When relevant, compare income vs expenses and suggest improvements
      6. If the user asks about a specific category, focus on that information
      7. Keep responses professional but conversational
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error con Gemini:', error);
    return "Lo siento, tuve un problema al procesar tu pregunta. ¿Podrías intentarlo de nuevo?";
  }
}
