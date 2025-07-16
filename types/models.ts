import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// User Profile Model
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  // User preferences
  currency: string;
  defaultBudgets: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  // App settings
  theme: 'light' | 'dark';
  notifications: boolean;
}

// Category Model
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  userId: string; // Reference to user who created it
  isDefault: boolean; // Whether it's a system default category
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

// Transaction Model (unified for both expenses and income)
export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string; // Category name
  categoryId?: string; // Reference to category document
  type: 'expense' | 'income';
  date: FirebaseFirestoreTypes.Timestamp;
  description?: string;
  
  // Recurring transaction fields
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'annually';
  recurringDay?: number; // Day of month for monthly recurring
  recurringWeekday?: number; // 0-6 (Sunday-Saturday) for weekly recurring
  recurringMonth?: number; // 0-11 for annually recurring
  recurringEndDate?: FirebaseFirestoreTypes.Timestamp; // Optional end date for recurring
  parentRecurringId?: string; // Reference to parent recurring transaction
  
  // Location and receipt info (for future features)
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  receiptURL?: string;
  
  // Metadata
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

// Budget Model
export interface Budget {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly' | 'annual';
  amount: number;
  period: {
    start: FirebaseFirestoreTypes.Timestamp;
    end: FirebaseFirestoreTypes.Timestamp;
  };
  categories?: string[]; // Optional: budget for specific categories
  spent: number; // Calculated field
  remaining: number; // Calculated field
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

// Analytics/Summary Model
export interface FinancialSummary {
  id: string;
  userId: string;
  period: {
    start: FirebaseFirestoreTypes.Timestamp;
    end: FirebaseFirestoreTypes.Timestamp;
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  categoryBreakdown: {
    [categoryName: string]: {
      amount: number;
      percentage: number;
      transactionCount: number;
    };
  };
  topCategories: {
    expense: string[];
    income: string[];
  };
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

// Notification Model
export interface Notification {
  id: string;
  userId: string;
  type: 'budget_alert' | 'recurring_reminder' | 'summary' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  data?: any; // Additional data payload
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

// Settings Model
export interface UserSettings {
  id: string;
  userId: string;
  currency: string;
  dateFormat: string;
  firstDayOfWeek: number; // 0-6 (Sunday-Saturday)
  budgetAlerts: {
    enabled: boolean;
    thresholds: {
      daily: number; // Percentage (e.g., 80 for 80%)
      weekly: number;
      monthly: number;
    };
  };
  notifications: {
    push: boolean;
    email: boolean;
    recurringReminders: boolean;
    budgetAlerts: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    biometricAuth: boolean;
  };
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Query Options
export interface QueryOptions {
  limit?: number;
  startAfter?: any;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: {
    field: string;
    operator: string;
    value: any;
  }[];
} 