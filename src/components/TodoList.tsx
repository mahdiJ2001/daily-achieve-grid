import { useState } from "react";
import { Task } from "./TodoApp";
import { TaskItem } from "./TaskItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Target } from "lucide-react";

interface TodoListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, newText: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TodoList = ({ tasks, onAddTask, onToggleTask, onUpdateTask, onDeleteTask }: TodoListProps) => {
  const [newTaskText, setNewTaskText] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });

  const completedToday = todaysTasks.filter(task => task.completed).length;
  const totalToday = todaysTasks.length;
  const progressPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card className="bg-gradient-surface border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="text-primary" size={20} />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {completedToday} of {totalToday} tasks completed
              </span>
              <span className="text-sm font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
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
              className="flex-1 bg-surface border-border/50 focus:border-primary"
            />
            <Button type="submit" className="bg-gradient-primary hover:shadow-glow transition-smooth">
              <Plus size={16} />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {todaysTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target size={48} className="mx-auto mb-4 opacity-50" />
              <p>No tasks for today. Add one above to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};