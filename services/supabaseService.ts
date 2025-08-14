import supabase from '../config/supabase';

// Types for your app data
export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  daily_budget: number;
  weekly_budget: number;
  monthly_budget: number;
  created_at: string;
  updated_at: string;
}

// Expense Services
export const expenseService = {
  // Get all expenses for the current user
  async getExpenses(): Promise<{ data: Expense[] | null; error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    return { data, error };
  },

  // Create a new expense
  async createExpense(expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Expense | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          ...expense,
          user_id: user.id,
        }
      ])
      .select()
      .single();
    
    return { data, error };
  },

  // Update an expense
  async updateExpense(id: string, updates: Partial<Expense>): Promise<{ data: Expense | null; error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete an expense
  async deleteExpense(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  // Get expenses by date range
  async getExpensesByDateRange(startDate: string, endDate: string): Promise<{ data: Expense[] | null; error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    return { data, error };
  },

  // Get expenses by category
  async getExpensesByCategory(category: string): Promise<{ data: Expense[] | null; error: any }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('category', category)
      .order('date', { ascending: false });
    
    return { data, error };
  },
};

// Category Services
export const categoryService = {
  // Get all categories for the current user
  async getCategories(): Promise<{ data: Category[] | null; error: any }> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    return { data, error };
  },

  // Create a new category
  async createCategory(category: Omit<Category, 'id' | 'user_id' | 'created_at'>): Promise<{ data: Category | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          ...category,
          user_id: user.id,
        }
      ])
      .select()
      .single();
    
    return { data, error };
  },

  // Update a category
  async updateCategory(id: string, updates: Partial<Category>): Promise<{ data: Category | null; error: any }> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete a category
  async deleteCategory(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    return { error };
  },
};

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to expense changes
  subscribeToExpenses(callback: (payload: any) => void) {
    return supabase
      .channel('expenses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to category changes
  subscribeToCategories(callback: (payload: any) => void) {
    return supabase
      .channel('categories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
        },
        callback
      )
      .subscribe();
  },
};

// Budget Services
export const budgetService = {
  // Get budget for the current user
  async getBudget(): Promise<{ data: Budget | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    return { data, error };
  },

  // Create or update budget
  async upsertBudget(budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Budget | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // First check if budget exists
    const { data: existingBudget } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const budgetData = {
      ...budget,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    // If budget exists, update it, otherwise insert new one
    if (existingBudget) {
      const { data, error } = await supabase
        .from('budgets')
        .update(budgetData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      return { data, error };
    } else {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budgetData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      return { data, error };
    }
  },
};

export default { expenseService, categoryService, budgetService, subscriptions };
