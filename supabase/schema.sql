-- ============================================================
-- Cognition UI — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() if not already enabled
create extension if not exists "pgcrypto";

-- ============================================================
-- CLEAN SLATE: drop old prototype tables if they exist
-- (safe to re-run — cascade handles FK dependencies)
-- ============================================================
drop view  if exists unclassified_sessions;
drop table if exists events   cascade;
drop table if exists sessions cascade;
drop table if exists projects cascade;

-- ============================================================
-- TABLE: projects
-- One row per website being tracked. Owned by a Supabase user.
-- ============================================================
create table projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  domain       text not null,
  tracking_id  uuid not null unique default gen_random_uuid(),
  created_at   timestamptz not null default now()
);

-- Index: look up all projects owned by a user
create index projects_user_id_idx on projects (user_id);

-- ============================================================
-- TABLE: events
-- Raw behavioural events sent by the JS SDK.
-- No auth required for inserts (public ingest endpoint).
-- ============================================================
create table events (
  id                uuid        primary key default gen_random_uuid(),
  tracking_id       uuid        not null references projects(tracking_id) on delete cascade,
  session_id        text        not null,
  event_type        text        not null
                      check (event_type in (
                        'click', 'hover', 'scroll', 'backtrack',
                        'dead_click', 'rage_click', 'page_view'
                      )),
  page_url          text        not null,
  element_selector  text,
  x                 integer,
  y                 integer,
  duration_ms       integer,     -- hover duration in milliseconds
  scroll_depth      integer      check (scroll_depth between 0 and 100),
  timestamp         timestamptz not null default now()
);

-- Indexes: the two most common query patterns
create index events_tracking_id_timestamp_idx
  on events (tracking_id, timestamp desc);

create index events_session_id_idx
  on events (session_id);

-- ============================================================
-- TABLE: sessions
-- One row per classified session. Written by the classifier,
-- not the SDK. session_id matches session_id in events.
-- ============================================================
create table sessions (
  id                text        primary key,  -- same value as session_id from events
  tracking_id       uuid        not null references projects(tracking_id) on delete cascade,
  archetype         text        check (archetype in (
                                  'explorer', 'goal_seeker',
                                  'confused', 'comparison_shopper'
                                )),
  velocity_score    float,
  backtrack_score   float,
  hesitation_score  float,
  exploration_score float,
  total_events      integer,
  session_start     timestamptz,
  session_end       timestamptz,
  classified_at     timestamptz
);

-- Index: dashboard time-range + archetype filter queries
create index sessions_tracking_id_start_idx
  on sessions (tracking_id, session_start desc);

create index sessions_archetype_idx
  on sessions (archetype);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table projects enable row level security;
alter table events   enable row level security;
alter table sessions enable row level security;

-- projects: a user can only read/write their own projects
create policy "projects: owner access"
  on projects for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- events INSERT: public — the SDK sends events without auth.
-- We validate tracking_id belongs to a real project (FK does that).
create policy "events: public insert"
  on events for insert
  with check (true);

-- events SELECT: only the owner of the matching project can read
create policy "events: owner read"
  on events for select
  using (
    exists (
      select 1 from projects p
      where p.tracking_id = events.tracking_id
        and p.user_id = auth.uid()
    )
  );

-- sessions INSERT/UPDATE: service role only (classifier cron job uses
-- the service-role key, which bypasses RLS — no policy needed).
-- SELECT: owner of the matching project
create policy "sessions: owner read"
  on sessions for select
  using (
    exists (
      select 1 from projects p
      where p.tracking_id = sessions.tracking_id
        and p.user_id = auth.uid()
    )
  );

-- ============================================================
-- HELPER VIEW: unclassified sessions
-- Used by the /api/sessions/classify cron to find work.
-- Returns session_ids where last event was > 30 min ago
-- and no row exists in sessions yet.
-- ============================================================
create or replace view unclassified_sessions as
select
  e.session_id,
  e.tracking_id,
  min(e.timestamp) as session_start,
  max(e.timestamp) as last_event_at,
  count(*)         as event_count
from events e
where not exists (
  select 1 from sessions s where s.id = e.session_id
)
group by e.session_id, e.tracking_id
having max(e.timestamp) < now() - interval '30 minutes';
