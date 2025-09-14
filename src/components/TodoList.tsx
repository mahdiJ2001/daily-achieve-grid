import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Plus, Loader2 } from "lucide-react";
import { TaskItem } from "./TaskItem";
import { getTodosForDate, addTodo, type Todo } from "@/lib/todos";
import { toast } from "@/hooks/use-toast";

export const TodoList = () => {
  const [newTaskText, setNewTaskText] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Get today's date in YYYY-MM-DD format (local timezone)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = formatDateLocal(new Date());

  // Load todos for today
  const loadTodos = async () => {
    try {
      setLoading(true);
      const todaysTodos = await getTodosForDate(today);
      setTodos(todaysTodos);
    } catch (error) {
      toast({
        title: "Error loading tasks",
        description: "Failed to load today's tasks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [today]);

  // Calculate progress for today's tasks
  const completedTasks = todos.filter(todo => todo.is_completed).length;
  const totalTasks = todos.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      setAdding(true);
      const newTodo = await addTodo(newTaskText.trim(), today);
      setTodos(prev => [...prev, newTodo]);
      setNewTaskText("");
      toast({
        title: "Task added",
        description: "Your task has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error adding task", 
        description: "Failed to add the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Today's Progress */}
      <Card className="shadow-sm border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Today's Progress</CardTitle>
          <CardDescription className="text-sm">
            {loading ? "Loading..." : `${completedTasks} of ${totalTasks} tasks completed`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress 
              value={progressPercentage} 
              className="h-2" 
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {progressPercentage}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Task Form */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              placeholder="Add a new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              disabled={adding}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={adding}
              className="px-4"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Task
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className="shadow-sm border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Today's Tasks</CardTitle>
          <CardDescription className="text-sm">
            {loading ? "Loading tasks..." : `${todos.length} task${todos.length !== 1 ? 's' : ''} for today`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm">Loading tasks...</span>
            </div>
          ) : todos.length > 0 ? (
            <div className="space-y-2">
              {todos.map(todo => (
                <TaskItem
                  key={todo.id}
                  task={todo}
                  onUpdate={loadTodos}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-1">No tasks for today yet</p>
              <p className="text-sm text-muted-foreground">Add your first task above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};