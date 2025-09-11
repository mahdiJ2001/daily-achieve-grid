import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Check, X, Loader2 } from "lucide-react";
import { toggleTodoComplete, updateTodoTitle, deleteTodo, type Todo } from "@/lib/todos";
import { toast } from "@/hooks/use-toast";

interface TaskItemProps {
  task: Todo;
  onUpdate: () => void; // Callback to refresh the todo list
}

export const TaskItem = ({ task, onUpdate }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.title);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    try {
      setLoading(true);
      await toggleTodoComplete(task.id);
      onUpdate();
      toast({
        title: task.is_completed ? "Task marked as incomplete" : "Task completed!",
        description: task.is_completed 
          ? "Task has been marked as incomplete." 
          : "Great job on completing this task!",
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editText.trim()) {
      setIsEditing(false);
      return;
    }

    if (editText.trim() === task.title) {
      setIsEditing(false);
      return;
    }

    try {
      setLoading(true);
      await updateTodoTitle(task.id, editText.trim());
      onUpdate();
      setIsEditing(false);
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteTodo(task.id);
      onUpdate();
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error deleting task",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditText(task.title);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-surface border border-border rounded-lg">
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          disabled={loading}
          className="flex-1 bg-input border-border"
          autoFocus
        />
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={loading}
            className="h-8 w-8 p-0 hover:bg-success/20 hover:text-success transition-smooth"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={loading}
            className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive transition-smooth"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-surface border border-border rounded-lg hover:border-primary/30 transition-smooth">
      <div className="flex items-center space-x-3">
        <Checkbox 
          checked={task.is_completed}
          onCheckedChange={handleToggle}
          disabled={loading}
          className="data-[state=checked]:bg-success data-[state=checked]:border-success transition-smooth"
        />
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm transition-smooth ${
            task.is_completed 
              ? "line-through text-muted-foreground" 
              : "text-card-foreground"
          }`}>
            {task.title}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditText(task.title);
              setIsEditing(true);
            }}
            disabled={loading}
            className="h-8 w-8 p-0 hover:bg-surface transition-smooth"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Edit className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive transition-smooth"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};