import { useState } from "react";
import { TodoList } from "./TodoList";
import { CalendarView } from "./CalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export const TodoApp = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <h1 className="mb-2 text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Todo Progress Tracker
              </h1>
              <p className="text-muted-foreground">
                Build daily habits and track your long-term progress
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-border hover:bg-surface"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
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
            <TodoList />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <CalendarView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};