import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskItem } from "./TaskItem";
import { getTodosForDate, getCalendarProgress, type Todo, type TaskProgress } from "@/lib/todos";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Helper function to format date in local timezone as YYYY-MM-DD
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateTodos, setSelectedDateTodos] = useState<Todo[]>([]);
  const [progressData, setProgressData] = useState<TaskProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [todosLoading, setTodosLoading] = useState(false);

  // Load calendar progress data
  const loadProgressData = async () => {
    try {
      setLoading(true);
      const data = await getCalendarProgress();
      setProgressData(data);
    } catch (error) {
      toast({
        title: "Error loading progress data",
        description: "Failed to load calendar progress.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load todos for selected date
  const loadSelectedDateTodos = async (date: Date) => {
    try {
      setTodosLoading(true);
      const dateStr = formatDateLocal(date);
      const todos = await getTodosForDate(dateStr);
      setSelectedDateTodos(todos);
    } catch (error) {
      toast({
        title: "Error loading tasks",
        description: "Failed to load tasks for the selected date.",
        variant: "destructive",
      });
    } finally {
      setTodosLoading(false);
    }
  };

  useEffect(() => {
    loadProgressData();
    loadSelectedDateTodos(selectedDate);
  }, []);

  useEffect(() => {
    loadSelectedDateTodos(selectedDate);
  }, [selectedDate]);

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month and how many days it has
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get what day of week the month starts (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = firstDayOfMonth.getDay();
    
    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Get progress for a specific date
  const getProgressForDate = (date: Date) => {
    const dateStr = formatDateLocal(date);
    return progressData.find(p => p.task_date === dateStr);
  };

  // Calculate current streak
  const calculateStreak = () => {
    let streak = 0;
    let checkDate = new Date();
    const today = formatDateLocal(new Date());
    
    // Go backwards day by day, but only count days up to today
    while (true) {
      const dateStr = formatDateLocal(checkDate);
      const progress = progressData.find(p => p.task_date === dateStr);
      
      // Stop if we find a day with no completed tasks (but had tasks)
      // or if there's no progress data for a day that should have been considered
      if (progress) {
        if (progress.completed_tasks === 0) {
          break; // Had tasks but none completed - streak ends
        }
        streak++; // Has completed tasks - continue streak
      } else {
        // No progress data for this date
        // Only break the streak if this is a past or current day
        // (we don't count future days or days without any tasks)
        if (dateStr <= today && streak > 0) {
          break;
        } else if (dateStr <= today) {
          // This is today or a past day with no tasks - no streak yet
          break;
        }
        // Future days are ignored
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
      
      // Safety check to prevent infinite loops (don't go back more than 365 days)
      if (streak > 365) break;
    }
    
    return streak;
  };

  // Calculate stats  
  const totalCompletedTasks = progressData.reduce((sum, p) => sum + p.completed_tasks, 0);
  const currentStreak = calculateStreak();
  
  // Tasks completed this month
  const currentMonth = new Date().getMonth() + 1; // JS months are 0-indexed
  const currentYear = new Date().getFullYear();
  const thisMonthTasks = progressData
    .filter(p => {
      const date = new Date(p.task_date);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.completed_tasks, 0);

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
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalCompletedTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">tasks finished</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : currentStreak}
            </div>
            <p className="text-xs text-muted-foreground mt-1">days in a row</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : thisMonthTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card className="shadow-sm border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Progress
          </CardTitle>
          <CardDescription className="text-sm">
            Click on any day to view tasks for that date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <div
                    key={`${day.getMonth()}-${day.getDate()}`}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square flex items-center justify-center text-sm cursor-pointer
                      transition-colors duration-200 rounded-md border border-transparent
                      hover:border-border hover:bg-accent/50
                      ${selectedDate.toDateString() === day.toDateString() 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : ''
                      }
                      ${(() => {
                        const progress = getProgressForDate(day);
                        if (!progress || progress.completed_tasks === 0) {
                          return 'text-muted-foreground';
                        }
                        const pct = progress.pct_completed;
                        if (selectedDate.toDateString() === day.toDateString()) return '';
                        if (pct === 100) return 'bg-green-50 text-green-700 border-green-200';
                        if (pct >= 50) return 'bg-blue-50 text-blue-700 border-blue-200';
                        return 'bg-orange-50 text-orange-700 border-orange-200';
                      })()}
                    `}
                  >
                    {day.getDate()}
                  </div>
                ) : (
                  <div className="aspect-square"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      <Card className="shadow-sm border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Tasks for {formatDate(selectedDate)}
          </CardTitle>
          <CardDescription className="text-sm">
            {todosLoading ? "Loading..." : `${selectedDateTodos.length} task${selectedDateTodos.length !== 1 ? 's' : ''} on this day`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todosLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm">Loading tasks...</span>
            </div>
          ) : selectedDateTodos.length > 0 ? (
            <div className="space-y-2">
              {selectedDateTodos.map(todo => (
                <TaskItem
                  key={todo.id}
                  task={todo}
                  onUpdate={() => {
                    loadSelectedDateTodos(selectedDate);
                    loadProgressData();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tasks on this day</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};