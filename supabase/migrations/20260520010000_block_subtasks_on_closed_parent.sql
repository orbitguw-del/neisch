-- 20260520010000_block_subtasks_on_closed_parent.sql
--
-- Bug fix (reported 2026-05-20): a task marked `submitted` or `done` could still
-- receive new sub-tasks via the frontend or direct API. RLS only checked role +
-- tenant; the parent's status was never consulted.
--
-- Fix: a BEFORE INSERT trigger on `tasks`. If the new row has a `parent_task_id`,
-- look up the parent's status. Reject if the parent is in a closed state.
-- This is defence-in-depth — the frontend (`Tasks.jsx:200`) also hides the
-- "+ Add sub-task" button on closed parents, but the DB now enforces it too.
--
-- Allowed parent states for sub-task creation:
--   pending     - planning phase
--   in_progress - live decomposition
--   blocked     - decomposition may be how you unblock
--
-- Blocked parent states:
--   submitted   - assignee marked finished, awaiting senior's confirm
--   done        - hard-closed by senior

create or replace function block_subtasks_on_closed_parent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parent_status text;
begin
  if new.parent_task_id is null then
    return new;
  end if;

  select status into parent_status
    from public.tasks
   where id = new.parent_task_id;

  if parent_status in ('submitted', 'done') then
    raise exception 'Cannot add sub-tasks to a % parent task', parent_status
      using errcode = 'check_violation',
            hint    = 'Send the parent task back to "in_progress" before adding more sub-tasks.';
  end if;

  return new;
end
$$;

drop trigger if exists block_subtasks_closed_parent on public.tasks;

create trigger block_subtasks_closed_parent
  before insert on public.tasks
  for each row
  execute function block_subtasks_on_closed_parent();
