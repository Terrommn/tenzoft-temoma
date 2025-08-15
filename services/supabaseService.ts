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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found in getBudget');
        return { data: null, error: { message: 'User not authenticated' } };
      }

      console.log('Fetching budget for user:', user.id);
      
      // First try to get the existing budget
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();  // Use maybeSingle instead of single to handle no rows gracefully
      
      if (error) {
        console.error('Error in getBudget:', error);
        return { data: null, error };
      }

      // If no budget exists, create default budget
      if (!data) {
        console.log('No budget found, creating default budget');
        const defaultBudget = {
          user_id: user.id,
          daily_budget: 50,
          weekly_budget: 300,
          monthly_budget: 1200,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newBudget, error: insertError } = await supabase
          .from('budgets')
          .insert(defaultBudget)
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default budget:', insertError);
          return { data: null, error: insertError };
        }

        console.log('Default budget created:', newBudget);
        return { data: newBudget, error: null };
      }

      console.log('Budget data retrieved:', data);
      return { data, error };
    } catch (error) {
      console.error('Unexpected error in getBudget:', error);
      return { data: null, error };
    }
  },

  // Create or update budget
  async upsertBudget(budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Budget | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found in upsertBudget');
        return { data: null, error: { message: 'User not authenticated' } };
      }

      console.log('Upserting budget for user:', user.id, 'Budget data:', budget);

      // Directly use upsert with user_id as the unique key
      const { data, error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          ...budget,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error in upsertBudget:', error);
        return { data: null, error };
      }

      console.log('Budget upserted successfully:', data);
      return { data, error };
    } catch (error) {
      console.error('Unexpected error in upsertBudget:', error);
      return { data: null, error };
    }
  },
};

export default { expenseService, categoryService, budgetService, subscriptions };
