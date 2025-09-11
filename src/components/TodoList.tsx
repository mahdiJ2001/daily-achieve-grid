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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

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
      <Card className="mb-6 bg-gradient-surface border-border shadow-glow">
        <CardHeader>
          <CardTitle className="text-card-foreground">Today's Progress</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : `${completedTasks} of ${totalTasks} tasks completed`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-surface" 
            />
            <p className="text-right text-sm font-medium text-accent">
              {progressPercentage}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add Task Form */}
      <Card className="bg-card-elevated border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              disabled={adding}
              className="flex-1 bg-surface border-border/50 focus:border-primary"
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={adding}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth"
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
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-card-foreground">Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Loading tasks...</p>
            </div>
          ) : todos.length > 0 ? (
            <div className="space-y-3">
              {todos.map(todo => (
                <TaskItem
                  key={todo.id}
                  task={todo}
                  onUpdate={loadTodos}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks for today yet.</p>
              <p className="text-sm">Add your first task above!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};