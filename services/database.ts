import firestore from '@react-native-firebase/firestore';
import {
    Budget,
    Category,
    PaginatedResponse,
    QueryOptions,
    Transaction,
    UserProfile
} from '../types/models';

// Get Firestore instance
const db = firestore();

// Collections
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'transactions';
const CATEGORIES_COLLECTION = 'categories';
const BUDGETS_COLLECTION = 'budgets';
const SUMMARIES_COLLECTION = 'summaries';

export class DatabaseService {
  // User Profile Operations
  static async createUserProfile(userId: string, profileData: Partial<UserProfile>) {
    try {
      const now = firestore.Timestamp.now();
      
      const userProfile: UserProfile = {
        id: userId,
        email: profileData.email!,
        displayName: profileData.displayName || '',
        photoURL: profileData.photoURL,
        currency: 'USD',
        defaultBudgets: {
          daily: 50,
          weekly: 300,
          monthly: 1200,
        },
        theme: 'dark',
        notifications: true,
        createdAt: now,
        updatedAt: now,
      };
      
      await db.collection(USERS_COLLECTION).doc(userId).set(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
  
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userSnap = await db.collection(USERS_COLLECTION).doc(userId).get();
      
      if (userSnap.exists) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
  
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      await db.collection(USERS_COLLECTION).doc(userId).update({
        ...updates,
        updatedAt: firestore.Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  // Transaction Operations
  static async createTransaction(userId: string, transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = firestore.Timestamp.now();
      
      const transaction: Omit<Transaction, 'id'> = {
        ...transactionData,
        userId,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await db.collection(TRANSACTIONS_COLLECTION).add(transaction);
      return { id: docRef.id, ...transaction };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
  
  static async getTransactions(userId: string, options: QueryOptions = {}): Promise<PaginatedResponse<Transaction>> {
    try {
      let query = db
        .collection(TRANSACTIONS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy(options.orderBy || 'date', options.orderDirection || 'desc');
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.startAfter) {
        query = query.startAfter(options.startAfter);
      }
      
      // Add additional where clauses
      if (options.where) {
        options.where.forEach(condition => {
          query = query.where(condition.field, condition.operator as any, condition.value);
        });
      }
      
      const querySnapshot = await query.get();
      const transactions: Transaction[] = [];
      
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      
      return {
        data: transactions,
        pagination: {
          page: 1,
          limit: options.limit || 50,
          total: transactions.length,
          hasMore: transactions.length === (options.limit || 50),
        },
      };
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }
  
  static async updateTransaction(transactionId: string, updates: Partial<Transaction>) {
    try {
      await db.collection(TRANSACTIONS_COLLECTION).doc(transactionId).update({
        ...updates,
        updatedAt: firestore.Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }
  
  static async deleteTransaction(transactionId: string) {
    try {
      await db.collection(TRANSACTIONS_COLLECTION).doc(transactionId).delete();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
  
  // Category Operations
  static async createCategory(userId: string, categoryData: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = firestore.Timestamp.now();
      
      const category: Omit<Category, 'id'> = {
        ...categoryData,
        userId,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await db.collection(CATEGORIES_COLLECTION).add(category);
      return { id: docRef.id, ...category };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
  
  static async getCategories(userId: string, type?: 'expense' | 'income'): Promise<Category[]> {
    try {
      let query = db
        .collection(CATEGORIES_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('name');
      
      if (type) {
        query = query.where('type', '==', type);
      }
      
      const querySnapshot = await query.get();
      const categories: Category[] = [];
      
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() } as Category);
      });
      
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }
  
  static async updateCategory(categoryId: string, updates: Partial<Category>) {
    try {
      await db.collection(CATEGORIES_COLLECTION).doc(categoryId).update({
        ...updates,
        updatedAt: firestore.Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }
  
  static async deleteCategory(categoryId: string) {
    try {
      await db.collection(CATEGORIES_COLLECTION).doc(categoryId).delete();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
  
  // Budget Operations
  static async createBudget(userId: string, budgetData: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = firestore.Timestamp.now();
      
      const budget: Omit<Budget, 'id'> = {
        ...budgetData,
        userId,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await db.collection(BUDGETS_COLLECTION).add(budget);
      return { id: docRef.id, ...budget };
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }
  
  static async getBudgets(userId: string): Promise<Budget[]> {
    try {
      const querySnapshot = await db
        .collection(BUDGETS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const budgets: Budget[] = [];
      
      querySnapshot.forEach((doc) => {
        budgets.push({ id: doc.id, ...doc.data() } as Budget);
      });
      
      return budgets;
    } catch (error) {
      console.error('Error getting budgets:', error);
      throw error;
    }
  }
  
  // Real-time listeners
  static subscribeToTransactions(userId: string, callback: (transactions: Transaction[]) => void) {
    return db
      .collection(TRANSACTIONS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .onSnapshot((querySnapshot) => {
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        callback(transactions);
      });
  }
  
  static subscribeToCategories(userId: string, callback: (categories: Category[]) => void) {
    return db
      .collection(CATEGORIES_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('name')
      .onSnapshot((querySnapshot) => {
        const categories: Category[] = [];
        querySnapshot.forEach((doc) => {
          categories.push({ id: doc.id, ...doc.data() } as Category);
        });
        callback(categories);
      });
  }
  
  // Initialize default categories for a new user
  static async initializeDefaultCategories(userId: string) {
    try {
      const batch = db.batch();
      const now = firestore.Timestamp.now();
      
      const defaultCategories = [
        // Expense Categories
        { name: 'Food', icon: 'restaurant', color: 'bg-orange-500', type: 'expense' as const },
        { name: 'Transport', icon: 'car', color: 'bg-blue-500', type: 'expense' as const },
        { name: 'Shopping', icon: 'bag', color: 'bg-purple-500', type: 'expense' as const },
        { name: 'Bills', icon: 'receipt', color: 'bg-red-500', type: 'expense' as const },
        { name: 'Entertainment', icon: 'game-controller', color: 'bg-pink-500', type: 'expense' as const },
        { name: 'Health', icon: 'medical', color: 'bg-green-500', type: 'expense' as const },
        { name: 'Groceries', icon: 'basket', color: 'bg-teal-500', type: 'expense' as const },
        { name: 'Utilities', icon: 'flash', color: 'bg-yellow-500', type: 'expense' as const },
        // Income Categories
        { name: 'Salary', icon: 'briefcase', color: 'bg-emerald-500', type: 'income' as const },
        { name: 'Freelance', icon: 'laptop', color: 'bg-cyan-500', type: 'income' as const },
        { name: 'Investment', icon: 'trending-up', color: 'bg-indigo-500', type: 'income' as const },
        { name: 'Business', icon: 'business', color: 'bg-lime-500', type: 'income' as const },
        { name: 'Side Hustle', icon: 'rocket', color: 'bg-pink-500', type: 'income' as const },
        { name: 'Bonus', icon: 'gift', color: 'bg-purple-500', type: 'income' as const },
      ];
      
      defaultCategories.forEach((categoryData) => {
        const categoryRef = db.collection(CATEGORIES_COLLECTION).doc();
        const category: Omit<Category, 'id'> = {
          ...categoryData,
          userId,
          isDefault: true,
          createdAt: now,
          updatedAt: now,
        };
        batch.set(categoryRef, category);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error initializing default categories:', error);
      throw error;
    }
  }
}

// Export individual functions for easier imports
export const {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createBudget,
  getBudgets,
  subscribeToTransactions,
  subscribeToCategories,
  initializeDefaultCategories,
} = DatabaseService; 