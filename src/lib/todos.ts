import { supabase } from "@/integrations/supabase/client";

export interface Todo {
  id: string;
  title: string;
  is_completed: boolean;
  task_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TaskProgress {
  task_date: string;
  total_tasks: number;
  completed_tasks: number;
  pct_completed: number;
}

// Get todos for a specific date
export const getTodosForDate = async (date: string): Promise<Todo[]> => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('task_date', date)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

// Add a new todo
export const addTodo = async (title: string, taskDate: string): Promise<Todo> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('todos')
    .insert({
      title,
      task_date: taskDate,
      user_id: user.id,
      is_completed: false
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Toggle todo completion
export const toggleTodoComplete = async (id: string): Promise<Todo> => {
  // First get the current todo to toggle its completion
  const { data: currentTodo, error: fetchError } = await supabase
    .from('todos')
    .select('is_completed')
    .eq('id', id)
    .single();
  
  if (fetchError) throw fetchError;
  
  const { data, error } = await supabase
    .from('todos')
    .update({ is_completed: !currentTodo.is_completed })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Update todo title
export const updateTodoTitle = async (id: string, title: string): Promise<Todo> => {
  const { data, error } = await supabase
    .from('todos')
    .update({ title })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Delete todo
export const deleteTodo = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Get calendar progress data
export const getCalendarProgress = async (): Promise<TaskProgress[]> => {
  const { data, error } = await supabase
    .from('task_progress_by_date')
    .select('*')
    .order('task_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};