-- Add RLS policies to task_progress_by_date to filter by user
ALTER TABLE task_progress_by_date ENABLE ROW LEVEL SECURITY;

-- Create policy to show only user's own task progress
CREATE POLICY "Users can view their own task progress" 
ON task_progress_by_date 
FOR SELECT 
USING (
  task_date IN (
    SELECT DISTINCT task_date 
    FROM todos 
    WHERE user_id = auth.uid()
  )
);