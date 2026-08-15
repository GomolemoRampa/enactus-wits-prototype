-- =========================================================
-- Row Level Security (RLS) — baseline policies
-- Run AFTER schema.sql (and its seed data — is_admin() depends on the
-- Role rows existing). Regenerated to match the actual schema.sql:
-- table is app_user (not user), PK is user_id, role names are
-- 'Member' / 'Admin' / 'SuperAdmin' / 'FacultyAdvisor' (no spaces),
-- audience_type is an enum (AllMembers / IdeaStage / PrototypeStage /
-- RunningBusiness / ExecutivesOnly), and audience_map maps
-- announcement_id -> user_id directly (no stage_id column).
-- =========================================================

alter table app_user enable row level security;
alter table report enable row level security;
alter table announcement enable row level security;
alter table audience_map enable row level security;
alter table event enable row level security;
alter table event_registration enable row level security;
alter table milestone enable row level security;
alter table resource enable row level security;
alter table resource_category enable row level security;
alter table role enable row level security;
alter table business_stage enable row level security;
alter table chat_log enable row level security;

-- Helper: is the current user an Admin or Super Admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from app_user u
    join role r on r.role_id = u.role_id
    where u.auth_user_id = auth.uid()
      and r.role_name in ('Admin', 'SuperAdmin')
  );
$$ language sql stable security definer;

-- Helper: is the current user a listed recipient of this announcement?
create or replace function is_recipient(p_announcement_id bigint)
returns boolean as $$
  select exists (
    select 1 from audience_map am
    join app_user u on u.auth_user_id = auth.uid()
    where am.announcement_id = p_announcement_id
      and am.user_id = u.user_id
  );
$$ language sql stable security definer;

-- ---- app_user ----
drop policy if exists "users can view own profile" on app_user;
create policy "users can view own profile" on app_user
  for select using (auth_user_id = auth.uid() or is_admin());

drop policy if exists "users can update own profile" on app_user;
create policy "users can update own profile" on app_user
  for update using (auth_user_id = auth.uid());

drop policy if exists "admin full access users" on app_user;
create policy "admin full access users" on app_user
  for all using (is_admin());

-- ---- report ----
drop policy if exists "users manage own reports" on report;
create policy "users manage own reports" on report
  for select using (
    user_id = (select user_id from app_user where auth_user_id = auth.uid())
    or is_admin()
  );

drop policy if exists "users insert own reports" on report;
create policy "users insert own reports" on report
  for insert with check (
    user_id = (select user_id from app_user where auth_user_id = auth.uid())
  );

drop policy if exists "admin update reports" on report;
create policy "admin update reports" on report
  for update using (is_admin());

-- ---- announcement ----
drop policy if exists "read visible announcements" on announcement;
create policy "read visible announcements" on announcement
  for select using (
    is_admin()
    or audience_type = 'AllMembers'
    or is_recipient(announcement_id)
  );

drop policy if exists "admin manage announcements" on announcement;
create policy "admin manage announcements" on announcement
  for all using (is_admin());

-- ---- event ----
drop policy if exists "read events by visibility" on event;
create policy "read events by visibility" on event
  for select using (
    visibility = 'Public' or auth.role() = 'authenticated'
  );

drop policy if exists "admin manage events" on event;
create policy "admin manage events" on event
  for all using (is_admin());

-- ---- event_registration ----
drop policy if exists "users manage own registrations" on event_registration;
create policy "users manage own registrations" on event_registration
  for all using (
    user_id = (select user_id from app_user where auth_user_id = auth.uid())
    or is_admin()
  );

-- ---- milestone ----
drop policy if exists "users manage own milestones" on milestone;
create policy "users manage own milestones" on milestone
  for all using (
    user_id = (select user_id from app_user where auth_user_id = auth.uid())
    or is_admin()
  );

-- ---- resource ----
drop policy if exists "authenticated read resources" on resource;
create policy "authenticated read resources" on resource
  for select using (auth.role() = 'authenticated');

drop policy if exists "admin manage resources" on resource;
create policy "admin manage resources" on resource
  for all using (is_admin());

-- ---- resource_category / role / business_stage ----
drop policy if exists "authenticated read categories" on resource_category;
create policy "authenticated read categories" on resource_category
  for select using (auth.role() = 'authenticated');

drop policy if exists "admin manage categories" on resource_category;
create policy "admin manage categories" on resource_category
  for all using (is_admin());

drop policy if exists "authenticated read roles" on role;
create policy "authenticated read roles" on role
  for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated read stages" on business_stage;
create policy "authenticated read stages" on business_stage
  for select using (auth.role() = 'authenticated');

-- ---- chat_log ----
drop policy if exists "users view own chatlog" on chat_log;
create policy "users view own chatlog" on chat_log
  for select using (
    user_id = (select user_id from app_user where auth_user_id = auth.uid())
    or is_admin()
  );

drop policy if exists "users insert own chatlog" on chat_log;
create policy "users insert own chatlog" on chat_log
  for insert with check (
    user_id = (select user_id from app_user where auth_user_id = auth.uid())
  );

-- ---- audience_map ----
drop policy if exists "admin manage audience map" on audience_map;
create policy "admin manage audience map" on audience_map
  for all using (is_admin());
