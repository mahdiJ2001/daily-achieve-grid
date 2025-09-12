import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

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
  const { data, error } = await sb
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
  
  const { data, error } = await sb
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
  const { data: currentTodo, error: fetchError } = await sb
    .from('todos')
    .select('is_completed')
    .eq('id', id)
    .maybeSingle();
  
  if (fetchError) throw fetchError;
  if (!currentTodo) throw new Error('Todo not found');

  const { data, error } = await sb
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
  const { data, error } = await sb
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
  const { error } = await sb
    .from('todos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Get calendar progress data for current user
export const getCalendarProgress = async (): Promise<TaskProgress[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Get all todos for the current user
  const { data: todos, error } = await sb
    .from('todos')
    .select('task_date, is_completed')
    .eq('user_id', user.id);
  
  if (error) throw error;
  
  // Calculate progress by date
  const progressMap = new Map<string, { total: number; completed: number }>();
  
  todos?.forEach(todo => {
    const date = todo.task_date;
    if (!progressMap.has(date)) {
      progressMap.set(date, { total: 0, completed: 0 });
    }
    const progress = progressMap.get(date)!;
    progress.total++;
    if (todo.is_completed) {
      progress.completed++;
    }
  });
  
  // Convert to TaskProgress array
  const progressData: TaskProgress[] = Array.from(progressMap.entries()).map(([date, progress]) => ({
    task_date: date,
    total_tasks: progress.total,
    completed_tasks: progress.completed,
    pct_completed: progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0
  }));
  
  // Sort by date descending
  progressData.sort((a, b) => new Date(b.task_date).getTime() - new Date(a.task_date).getTime());
  
  return progressData;
};