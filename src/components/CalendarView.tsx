import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskItem } from "./TaskItem";
import { getTodosForDate, getCalendarProgress, type Todo, type TaskProgress } from "@/lib/todos";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
      const dateStr = date.toISOString().split('T')[0];
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
    const dateStr = date.toISOString().split('T')[0];
    return progressData.find(p => p.task_date === dateStr);
  };

  // Calculate current streak
  const calculateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let checkDate = new Date();
    
    // Go backwards day by day
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const progress = progressData.find(p => p.task_date === dateStr);
      
      if (!progress || progress.completed_tasks === 0) {
        break;
      }
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalCompletedTasks}
            </div>
            <p className="text-xs text-muted-foreground">tasks finished</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : currentStreak}
            </div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : thisMonthTasks}
            </div>
            <p className="text-xs text-muted-foreground">tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Progress
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
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <div
                    key={`${day.getMonth()}-${day.getDate()}`}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square flex items-center justify-center text-sm cursor-pointer
                      transition-smooth hover:bg-surface rounded-md
                      ${selectedDate.toDateString() === day.toDateString() 
                        ? 'bg-accent text-accent-foreground shadow-glow' 
                        : ''
                      }
                      ${(() => {
                        const progress = getProgressForDate(day);
                        if (!progress || progress.completed_tasks === 0) {
                          return 'text-card-foreground';
                        }
                        const pct = progress.pct_completed;
                        if (pct === 100) return 'bg-success text-success-foreground font-medium';
                        if (pct >= 50) return 'bg-success/60 text-success-foreground font-medium';
                        return 'bg-success/20 text-success font-medium';
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
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Tasks for {formatDate(selectedDate)}
          </CardTitle>
          <CardDescription>
            {todosLoading ? "Loading..." : `${selectedDateTodos.length} task(s) on this day`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todosLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Loading tasks...</p>
            </div>
          ) : selectedDateTodos.length > 0 ? (
            <div className="space-y-3">
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
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks on this day.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};