import { useState } from "react";
import { Task } from "./TodoApp";
import { TaskItem } from "./TaskItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, newText: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const CalendarView = ({ tasks, onUpdateTask, onDeleteTask }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month and year
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Generate calendar days for current month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentYear === today.getFullYear() && currentMonth === today.getMonth() 
    ? today.getDate() 
    : new Date(currentYear, currentMonth + 1, 0).getDate());
  
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

  const calendarDays = [];
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // End on Saturday

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    calendarDays.push(new Date(d));
  }

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.completedAt) return false;
      const taskDate = new Date(task.completedAt);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    const checkDate = new Date(today);
    
    while (checkDate >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      const tasksOnDay = getTasksForDate(checkDate);
      if (tasksOnDay.length > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const totalCompletedTasks = tasks.filter(task => task.completed).length;
  const currentStreak = calculateStreak();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-primary border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="text-primary-foreground" size={24} />
              <div>
                <p className="text-primary-foreground/80 text-sm">Total Completed</p>
                <p className="text-2xl font-bold text-primary-foreground">{totalCompletedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-accent border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-accent-foreground" size={24} />
              <div>
                <p className="text-accent-foreground/80 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-accent-foreground">{currentStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="text-foreground" size={24} />
              <div>
                <p className="text-muted-foreground text-sm">This Month</p>
                <p className="text-2xl font-bold text-foreground">
                  {tasks.filter(task => {
                    if (!task.completedAt) return false;
                    const taskDate = new Date(task.completedAt);
                    return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle>
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(date => {
              const dayTasks = getTasksForDate(date);
              const isCurrentMonth = date.getMonth() === currentMonth;
              const isToday = date.toDateString() === today.toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "relative p-3 rounded-lg text-sm transition-smooth hover:bg-surface",
                    !isCurrentMonth && "opacity-30",
                    isToday && "ring-2 ring-primary",
                    isSelected && "bg-primary/20 border border-primary",
                    dayTasks.length > 0 && "bg-success/10 border border-success/30"
                  )}
                >
                  <span className={cn(
                    isToday && "font-bold",
                    dayTasks.length > 0 && "text-success"
                  )}>
                    {date.getDate()}
                  </span>
                  
                  {dayTasks.length > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 bg-success text-success-foreground"
                      variant="secondary"
                    >
                      {dayTasks.length}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <Card className="bg-card-elevated border-border/50">
          <CardHeader>
            <CardTitle>Tasks completed on {formatDate(selectedDate)}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tasks completed on this day</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => {}} // Disable toggle for completed tasks in calendar view
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};