-- =========================================================
-- Enactus Wits Support System — Supabase Schema
-- Generated from ERD: 02 Group11_UseCases&Models
-- Run this in Supabase SQL Editor (Database > SQL Editor > New query)
-- =========================================================

-- -------------------------
-- 0. ENUM TYPES
-- -------------------------

create type report_type as enum ('Financial', 'Marketing', 'Overall');
create type report_status as enum ('Pending', 'Reviewed', 'Flagged', 'SubmittedLate');

create type account_status as enum ('Pending', 'Active', 'Inactive', 'Rejected');

create type audience_type as enum ('AllMembers', 'IdeaStage', 'PrototypeStage', 'RunningBusiness', 'ExecutivesOnly');

create type event_visibility as enum ('Public', 'MembersOnly');
create type event_status as enum ('Upcoming', 'Cancelled', 'Completed');

create type milestone_source as enum ('MemberLogged', 'SystemGenerated');

create type resource_content_type as enum ('Document', 'Video', 'Link', 'Template');

-- -------------------------
-- 1. LOOKUP TABLES (no FKs) — create first
-- -------------------------

create table if not exists role (
    role_id           bigint generated always as identity primary key,
    role_name         varchar(50) not null unique,
    role_description  text
);

create table if not exists business_stage (
    business_stage_id  bigint generated always as identity primary key,
    stage_name         varchar(50) not null unique,
    stage_description  text
);

create table if not exists resource_category (
    category_id   bigint generated always as identity primary key,
    category_name varchar(100) not null unique,
    created_at    timestamptz not null default now()
);

-- -------------------------
-- 2. USER (depends on role, business_stage)
-- -------------------------

create table if not exists app_user (
    user_id           bigint generated always as identity primary key,
    auth_user_id      uuid not null unique references auth.users(id) on delete cascade,
    full_name         varchar(100) not null,
    wits_email        varchar(150) not null unique,
    role_id           bigint not null references role(role_id),
    business_stage_id bigint references business_stage(business_stage_id),
    account_status    account_status not null default 'Active',
    join_date         date not null default current_date,
    cell_number       varchar(15),
    last_login        timestamptz
);

-- Domain constraint: allow both student and staff/advisor emails
alter table app_user
  drop constraint if exists chk_wits_email_domain;
alter table app_user
  add constraint chk_wits_email_domain
  check (
    wits_email like '%@students.wits.ac.za'
    or wits_email like '%@wits.ac.za'
  );

-- NOTE: The handle_new_auth_user trigger and domain validation trigger
-- are defined in triggers.sql — run that file after this one.

-- -------------------------
-- 3. REPORT (self-referencing FK for resubmission)
-- -------------------------

create table if not exists report (
    report_id            bigint generated always as identity primary key,
    user_id               bigint not null references app_user(user_id),
    report_type           report_type not null default 'Overall',
    submission_period     varchar(20) not null,
    content                jsonb,
    submitted_at           timestamptz not null default now(),
    status                 report_status not null default 'Pending',
    reviewed_by_user_id    bigint references app_user(user_id),
    admin_comments         text,
    is_late                boolean not null default false,
    parent_report_id       bigint references report(report_id)
);

-- -------------------------
-- 4. ANNOUNCEMENT + AUDIENCE MAP
-- -------------------------

create table if not exists announcement (
    announcement_id    bigint generated always as identity primary key,
    title               varchar(200) not null,
    body                text,
    created_by_user_id  bigint not null references app_user(user_id),
    created_at          timestamptz not null default now(),
    audience_type       audience_type not null default 'AllMembers',
    recipient_count     int not null default 0,
    pinned              boolean not null default false
);

create table if not exists audience_map (
    audience_map_id  bigint generated always as identity primary key,
    announcement_id   bigint not null references announcement(announcement_id) on delete cascade,
    user_id           bigint not null references app_user(user_id),
    email_delivered   boolean not null default false,
    delivered_at      timestamptz,
    unique (announcement_id, user_id)
);

-- -------------------------
-- 5. EVENT + EVENT REGISTRATION
-- -------------------------

create table if not exists event (
    event_id           bigint generated always as identity primary key,
    title               varchar(200) not null,
    event_date          timestamptz not null,
    category             varchar(100),
    visibility            event_visibility not null default 'MembersOnly',
    created_by_user_id    bigint not null references app_user(user_id),
    status                event_status not null default 'Upcoming',
    description           text
);

create table if not exists event_registration (
    registration_id  bigint generated always as identity primary key,
    event_id          bigint not null references event(event_id) on delete cascade,
    user_id           bigint not null references app_user(user_id),
    registered_at     timestamptz not null default now(),
    attended          boolean not null default false,
    unique (event_id, user_id)
);

-- -------------------------
-- 6. MILESTONE
-- -------------------------

create table if not exists milestone (
    milestone_id             bigint generated always as identity primary key,
    user_id                   bigint not null references app_user(user_id),
    title                     varchar(200) not null,
    milestone_date            date not null default current_date,
    source                    milestone_source not null default 'MemberLogged',
    is_flagged_for_showcase   boolean not null default false
);

-- -------------------------
-- 7. RESOURCE (depends on business_stage, resource_category, app_user)
-- -------------------------

create table if not exists resource (
    resource_id          bigint generated always as identity primary key,
    title                 varchar(200) not null,
    content_type          resource_content_type not null,
    url                    varchar(500) not null,
    business_stage_id     bigint references business_stage(business_stage_id),
    category_id           bigint references resource_category(category_id),
    uploaded_by_user_id    bigint not null references app_user(user_id),
    uploaded_at            timestamptz not null default now()
);

-- -------------------------
-- 8. CHAT LOG
-- -------------------------

create table if not exists chat_log (
    chat_log_id         bigint generated always as identity primary key,
    user_id              bigint not null references app_user(user_id),
    query                 text not null,
    response              text,
    timestamp             timestamptz not null default now(),
    is_flagged            boolean not null default false,
    escalated_to_user_id  bigint references app_user(user_id)
);

-- -------------------------
-- 9. INDEXES
-- -------------------------

create index if not exists idx_app_user_role on app_user(role_id);
create index if not exists idx_app_user_stage on app_user(business_stage_id);

create index if not exists idx_report_user on report(user_id);
create index if not exists idx_report_reviewer on report(reviewed_by_user_id);
create index if not exists idx_report_parent on report(parent_report_id);

create index if not exists idx_announcement_creator on announcement(created_by_user_id);
create index if not exists idx_audience_map_announcement on audience_map(announcement_id);
create index if not exists idx_audience_map_user on audience_map(user_id);

create index if not exists idx_event_creator on event(created_by_user_id);
create index if not exists idx_event_reg_event on event_registration(event_id);
create index if not exists idx_event_reg_user on event_registration(user_id);

create index if not exists idx_milestone_user on milestone(user_id);

create index if not exists idx_resource_stage on resource(business_stage_id);
create index if not exists idx_resource_category on resource(category_id);
create index if not exists idx_resource_uploader on resource(uploaded_by_user_id);

create index if not exists idx_chatlog_user on chat_log(user_id);
create index if not exists idx_chatlog_escalated on chat_log(escalated_to_user_id);

-- -------------------------
-- 10. SEED DATA
-- -------------------------

insert into role (role_name, role_description) values
('Member', 'Standard student entrepreneur'),
('Admin', 'Subcommittee member with operational control'),
('SuperAdmin', 'Executive leadership with strategic oversight'),
('FacultyAdvisor', 'Academic supervisor with read-only access')
on conflict (role_name) do nothing;

insert into business_stage (stage_name, stage_description) values
('Idea', 'Initial concept and ideation phase'),
('Prototype', 'Building and testing the MVP'),
('RunningBusiness', 'Live business generating revenue or users')
on conflict (stage_name) do nothing;
