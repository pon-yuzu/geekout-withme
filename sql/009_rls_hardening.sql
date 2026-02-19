-- ============================================================
-- RLS Hardening Migration
-- ============================================================

-- 1. profiles: Restrict public read to authenticated users only
--    Previously anyone (including anonymous) could read all profiles.
drop policy if exists "Profiles are viewable by everyone" on public.profiles;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- 2. voice_rooms: Prevent deletion of permanent rooms
--    Previously room creators could delete any room they created,
--    including permanent (seeded) rooms.
drop policy if exists "Room creators can delete their rooms" on public.voice_rooms;

create policy "Room creators can delete non-permanent rooms"
  on public.voice_rooms for delete
  using (auth.uid() = created_by and is_permanent = false);

-- 3. assessment_results: Prevent modification/deletion (immutable records)
--    Assessment results should be append-only for data integrity.
--    No UPDATE or DELETE policies exist, but let's be explicit.
create policy "Assessment results are immutable (no updates)"
  on public.assessment_results for update
  using (false);

create policy "Assessment results are immutable (no deletes)"
  on public.assessment_results for delete
  using (false);
