import { useState } from "react";
import { TodoList } from "./TodoList";
import { CalendarView } from "./CalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckSquare } from "lucide-react";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export const TodoApp = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('todoapp-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('todoapp-tasks', JSON.stringify(newTasks));
  };

  const addTask = (text: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date(),
    };
    updateTasks([...tasks, newTask]);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId 
        ? { ...task, completed: !task.completed, completedAt: task.completed ? undefined : new Date() }
        : task
    );
    updateTasks(updatedTasks);
  };

  const updateTaskText = (taskId: string, newText: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task
    );
    updateTasks(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    updateTasks(updatedTasks);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Todo Progress Tracker
          </h1>
          <p className="text-muted-foreground">
            Build daily habits and track your long-term progress
          </p>
        </div>

        {/* Main App */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-surface">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <CheckSquare size={16} />
              Today's Tasks
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar size={16} />
              Progress Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            <TodoList
              tasks={tasks}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onUpdateTask={updateTaskText}
              onDeleteTask={deleteTask}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <CalendarView
              tasks={tasks}
              onUpdateTask={updateTaskText}
              onDeleteTask={deleteTask}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};