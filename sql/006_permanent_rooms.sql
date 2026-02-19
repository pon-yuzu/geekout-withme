-- Add is_permanent column to voice_rooms
alter table public.voice_rooms
  add column if not exists is_permanent boolean default false;

-- Seed permanent rooms (idempotent)
insert into public.voice_rooms (name, description, language, max_participants, is_permanent, is_active)
select 'おしゃべりルーム / Chat Lounge', 'Free chat in any language', 'mixed', 20, true, true
where not exists (
  select 1 from public.voice_rooms where name = 'おしゃべりルーム / Chat Lounge'
);

insert into public.voice_rooms (name, description, language, max_participants, is_permanent, is_active)
select 'もくもく作業部屋 / Focus Room', 'Quiet coworking space', 'mixed', 20, true, true
where not exists (
  select 1 from public.voice_rooms where name = 'もくもく作業部屋 / Focus Room'
);
