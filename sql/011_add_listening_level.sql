-- Add listening_level column to assessment_results
alter table public.assessment_results
  add column if not exists listening_level text;

-- Update mode check constraint to include 'listening'
alter table public.assessment_results
  drop constraint if exists assessment_results_mode_check;

alter table public.assessment_results
  add constraint assessment_results_mode_check
  check (mode in ('text', 'listening', 'voice', 'both'));
