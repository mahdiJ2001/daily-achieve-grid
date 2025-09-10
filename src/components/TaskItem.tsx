import { useState } from "react";
import { Task } from "./TodoApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onUpdate: (taskId: string, newText: string) => void;
  onDelete: (taskId: string) => void;
}

export const TaskItem = ({ task, onToggle, onUpdate, onDelete }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(task.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-surface border border-border/30 transition-smooth hover:border-border/60",
        task.completed && "bg-success/5 border-success/20"
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="data-[state=checked]:bg-gradient-primary data-[state=checked]:border-primary"
      />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-surface border-border/50"
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="p-2 hover:bg-success/20"
          >
            <Check size={14} className="text-success" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="p-2 hover:bg-destructive/20"
          >
            <X size={14} className="text-destructive" />
          </Button>
        </div>
      ) : (
        <>
          <span
            className={cn(
              "flex-1 transition-smooth",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.text}
          </span>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-accent/20"
            >
              <Edit2 size={14} className="text-accent" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(task.id)}
              className="p-2 hover:bg-destructive/20"
            >
              <Trash2 size={14} className="text-destructive" />
            </Button>
          </div>
        </>
      )}

      {task.completed && (
        <div className="text-xs text-success px-2 py-1 bg-success/10 rounded-full">
          ✓ Done
        </div>
      )}
    </div>
  );
};