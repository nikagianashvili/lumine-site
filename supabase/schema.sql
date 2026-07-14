-- Lumine's backend schema. Run in Supabase's SQL Editor
-- (Dashboard → SQL Editor → New query). Base tables use "create table if
-- not exists" (a no-op if they already exist — it does NOT add missing
-- columns to an existing table, that's what the ALTER statements below
-- each table are for). New columns use "add column if not exists". Safe
-- to run top-to-bottom at any point, including against a database that
-- already has some or all of it.

-- ── Content tables (currently hardcoded in js/*-data.js) ────────────────

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  client text,
  service_type text not null check (service_type in ('web', 'photo-video', 'design')),
  industry text not null,
  year text,
  status text default 'Concept',
  featured boolean default false,
  sort_order int default 0,
  -- Type-specific + bilingual narrative fields (blurb, heroTagline,
  -- challenge/research/development, testimonial, results, and their _ka
  -- counterparts) vary per serviceType — kept as one flexible JSON blob
  -- rather than ~20 mostly-null columns.
  content jsonb not null default '{}',
  created_at timestamptz default now()
);

create table if not exists pricing_packages (
  id uuid primary key default gen_random_uuid(),
  numeral text,
  name text not null,
  name_ka text,
  price text not null,
  per_month jsonb default '[]',
  includes jsonb default '[]',
  includes_ka jsonb default '[]',
  addon text,
  addon_ka text,
  featured boolean default false,
  sort_order int default 0
);

create table if not exists pricing_singles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ka text,
  price text not null,
  sort_order int default 0
);

create table if not exists journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  title_ka text,
  excerpt text,
  excerpt_ka text,
  body text,
  body_ka text,
  published_at date default current_date,
  sort_order int default 0
);

-- ── Team accounts ────────────────────────────────────────────────────────
-- Rides on Supabase's built-in auth.users; this table just adds the fields
-- auth.users doesn't have (role, display name).

create table if not exists team_members (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  role text not null default 'member', -- a specialty label (Founder/Orchestrator/Media/Design/…), not an access tier
  created_at timestamptz default now()
);

-- Skills/status/permissions substrate (admin rebuild Phase 7) - role
-- above stays a free-text specialty label on purpose; access_level is
-- the actual (currently unenforced) permission tier.
alter table team_members add column if not exists access_level text default 'admin'; -- "admin" (full access) | "member" (scoped) - not yet enforced anywhere in the API
alter table team_members add column if not exists skills_tags text[] default '{}'; -- @ai-ops / @web-dev / @photo / @brand-design / @smm / @strategy
alter table team_members add column if not exists status text default 'Available'; -- Available / Focused / On Set / Away - manual, self-set, never inferred
alter table team_members add column if not exists focus_mode boolean default false;

-- ── Clients (pillar 4) ───────────────────────────────────────────────────
-- One record per contact, from first inquiry through becoming a real
-- client — status is the pipeline stage, not a separate "won" table.

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text,
  email text,
  phone text,
  company text,
  source text not null default 'contact_form', -- contact_form | ai_consultant | ai_chat | manual
  status text not null default 'new', -- new | hot | warm | cold | client | lost
  value_estimate text,
  assigned_to uuid references team_members (id),
  last_contacted_at timestamptz,
  notes text,
  meta jsonb default '{}' -- e.g. consultant quiz answers, raw contact-form message
);

-- ── Workflow / management (pillar 3) ─────────────────────────────────────
-- An "engagement" is actual paid work for a client — separate from the
-- public portfolio `projects` table above, which is marketing content
-- (case studies), not operational tracking. "Publish to Portfolio" (admin
-- rebuild Phase 4) writes a completed engagement into `projects`.

create table if not exists engagements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients (id) on delete set null,
  title text not null,
  status text not null default 'active', -- active | on_hold | completed | cancelled
  start_date date,
  end_date date,
  budget text,
  notes text,
  created_at timestamptz default now()
);

-- Admin rebuild Phase 2/4 - real Client/Project/Task linking + Archive
alter table engagements add column if not exists service_type text; -- web | photo-video | design | smm - drives the Phase 3 pipeline template
alter table engagements add column if not exists cover_image_url text;
alter table engagements add column if not exists industry text; -- matches the public projects.industry taxonomy - pre-fills Publish to Portfolio
-- Phase 5 - retainer quota tracker + offboarding-upsell automation
alter table engagements add column if not exists is_retainer boolean default false; -- false = "Solo Service" (one-off), eligible for the upsell cron
alter table engagements add column if not exists retainer_tier text; -- Starter | Growth | Full Beam - matches js/pricing-data.js's real packages
alter table engagements add column if not exists posters_limit int;
alter table engagements add column if not exists posters_delivered int default 0;
alter table engagements add column if not exists videos_limit int;
alter table engagements add column if not exists videos_delivered int default 0;
alter table engagements add column if not exists completed_at timestamptz; -- stamped server-side whenever status transitions to "completed" - never client-set
alter table engagements add column if not exists upsell_task_created boolean default false; -- guards api/cron/offboarding-upsell.js from firing twice on one completion
-- Phase 6 - War Room / MRR dashboard
alter table engagements add column if not exists monthly_rate numeric; -- structured, not parsed out of the free-text `budget` column above

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references engagements (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo', -- todo | in_progress | review | done
  priority text not null default 'medium', -- low | medium | high
  assignee uuid references team_members (id),
  due_date date,
  created_at timestamptz default now()
);

-- Phase 2/3 - denormalized from the task's engagement so Board/Spreadsheet
-- can filter without a join; only ever set from the project's own
-- service_type, never edited independently
alter table tasks add column if not exists service_type text;
alter table tasks add column if not exists stage text; -- fine-grained per-service pipeline stage (e.g. "Shoot Day", "QA") - status above is derived from this
-- Phase 7 - hat-tags, independent of the single `assignee`
alter table tasks add column if not exists hat_tags text[] default '{}';

-- ── Marketing office (pillar 2) ──────────────────────────────────────────
-- Planning/scheduling for content across channels — distinct from
-- journal_posts above, which is the live published table the public
-- journal page actually reads. A content_calendar row becomes a
-- journal_posts row (or a real Instagram post, etc.) once it ships.

create table if not exists content_calendar (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'journal', -- journal | social | email | ad | other
  title text not null,
  body text,
  platform text, -- e.g. instagram, journal, email — free text, not enforced
  status text not null default 'idea', -- idea | draft | scheduled | published
  scheduled_at timestamptz,
  published_at timestamptz,
  assigned_to uuid references team_members (id),
  notes text,
  created_at timestamptz default now()
);

-- ── AI front office (pillar 1) ───────────────────────────────────────────
-- Every AI chat/consultant session, so conversations are reviewable and a
-- qualified visitor can be linked to a real client record.

create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  channel text not null default 'chat', -- chat | consultant
  client_id uuid references clients (id) on delete set null,
  language text default 'en', -- en | ka
  transcript jsonb not null default '[]', -- array of {role, content, ts}
  status text not null default 'open', -- open | qualified | closed
  summary text
);

-- ── Water Cooler / social feed (admin rebuild Phase 8) ───────────────────
-- Lightweight team feed, distinct from Activity (a read-only unified
-- timeline built client-side from the tables above, no table of its own).
-- Brand new table - CREATE TABLE IF NOT EXISTS is correct here.

create table if not exists water_cooler_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references team_members (id), -- null for automated celebrations
  type text not null default 'manual', -- manual | celebration
  body text not null,
  file_url text, -- a pasted link, not a real upload - this table predates real file storage (Phase 9)
  reactions jsonb not null default '{}', -- {emoji: [team_member_id, ...]} - a toggle set per emoji, not a count
  engagement_id uuid references engagements (id) on delete set null,
  created_at timestamptz default now()
);

-- ── Agency Brain: Folders, real files, Playbook (admin rebuild Phase 9) ──
-- Real file storage lives in a private Supabase Storage bucket
-- (agency-files) — created directly via the Storage API, not SQL, so
-- there's nothing to run for the bucket itself. `files` rows point into
-- it by `path`; signed URLs are generated fresh per request, never stored.
--
-- Documents (invoices/contracts, tied to a client) and Folders (creative
-- project work, tied to a project or an account-level folder) are
-- deliberately separate concepts in the admin UI, but share this one
-- table — `category` distinguishes them rather than two upload pipelines.
-- All three tables below are brand new - CREATE TABLE IF NOT EXISTS is
-- correct for them.

create table if not exists folders (
  id uuid primary key default gen_random_uuid(), -- account-level folders only; project files use files.engagement_id directly, no folder row needed
  name text not null,
  created_at timestamptz default now()
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  path text not null, -- storage object key in the "agency-files" bucket
  content_type text,
  size_bytes int,
  category text not null default 'creative', -- creative (Folders/Creative Library) | document (Documents, tied to a client)
  folder_id uuid references folders (id) on delete set null,
  engagement_id uuid references engagements (id) on delete set null,
  client_id uuid references clients (id) on delete set null,
  skills_tags text[] default '{}', -- powers the Creative Library's hat filter
  uploaded_by uuid references team_members (id),
  created_at timestamptz default now()
);

create table if not exists playbook_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null, -- real structured docs written directly in the admin, not uploaded files
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Row-level security ───────────────────────────────────────────────────
-- All API writes go through /api serverless functions using the
-- service_role key, which bypasses RLS entirely — these policies only
-- govern what the browser's anon key is allowed to touch directly.

alter table projects enable row level security;
alter table pricing_packages enable row level security;
alter table pricing_singles enable row level security;
alter table journal_posts enable row level security;
alter table team_members enable row level security;
alter table clients enable row level security;
alter table engagements enable row level security;
alter table tasks enable row level security;
alter table content_calendar enable row level security;
alter table ai_conversations enable row level security;
alter table water_cooler_posts enable row level security;
alter table folders enable row level security;
alter table files enable row level security;
alter table playbook_entries enable row level security;

-- Public site can read content tables directly with the anon key...
drop policy if exists "public read projects" on projects;
create policy "public read projects" on projects for select using (true);
drop policy if exists "public read pricing_packages" on pricing_packages;
create policy "public read pricing_packages" on pricing_packages for select using (true);
drop policy if exists "public read pricing_singles" on pricing_singles;
create policy "public read pricing_singles" on pricing_singles for select using (true);
drop policy if exists "public read journal_posts" on journal_posts;
create policy "public read journal_posts" on journal_posts for select using (true);

-- ...but nothing else is anon-readable: clients, engagements, tasks,
-- content_calendar, ai_conversations, team_members, water_cooler_posts,
-- folders, files, and playbook_entries are all service_role (server-side
-- /api) only. No policies means no anon access at all.
