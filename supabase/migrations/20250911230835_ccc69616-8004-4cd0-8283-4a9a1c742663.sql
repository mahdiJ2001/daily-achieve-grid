-- Enable UUID helper
create extension if not exists "pgcrypto";

-- Trigger function to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Todos table
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  task_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to set updated_at
create trigger todos_set_updated_at
before update on public.todos
for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.todos enable row level security;

-- Policies so each user only sees/edits their own todos
create policy "Select own todos" on public.todos for select using (auth.uid() = user_id);
create policy "Insert own todos" on public.todos for insert with check (auth.uid() = user_id);
create policy "Update own todos" on public.todos for update using (auth.uid() = user_id);
create policy "Delete own todos" on public.todos for delete using (auth.uid() = user_id);

-- View for aggregated progress by date
create or replace view public.task_progress_by_date as
select
  task_date,
  count(*) as total_tasks,
  count(*) filter (where is_completed) as completed_tasks,
  case when count(*) = 0 then 0
       else round(100.0 * count(*) filter (where is_completed) / count(*), 2)
  end as pct_completed
from public.todos
group by task_date
order by task_date;