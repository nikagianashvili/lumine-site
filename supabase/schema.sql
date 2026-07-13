-- Draft schema for Lumine's backend. Run this in Supabase's SQL Editor
-- (Dashboard → SQL Editor → New query) once the project exists.
-- Review field names/types against js/projects-data.js and
-- js/pricing-data.js before running — this mirrors those shapes but nothing
-- is final until you say so.

-- ── Content tables (currently hardcoded in js/*-data.js) ────────────────

create table projects (
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

create table pricing_packages (
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

create table pricing_singles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ka text,
  price text not null,
  sort_order int default 0
);

create table journal_posts (
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

create table team_members (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  role text not null default 'member', -- admin | member
  created_at timestamptz default now()
);

-- ── Clients (pillar 4) ───────────────────────────────────────────────────
-- One record per contact, from first inquiry through becoming a real
-- client — status is the pipeline stage, not a separate "won" table.

create table clients (
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
-- (case studies), not operational tracking. A portfolio project MAY
-- reference the engagement it came from once real work starts.

create table engagements (
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

create table tasks (
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

-- ── Marketing office (pillar 2) ──────────────────────────────────────────
-- Planning/scheduling for content across channels — distinct from
-- journal_posts above, which is the live published table the public
-- journal page actually reads. A content_calendar row becomes a
-- journal_posts row (or a real Instagram post, etc.) once it ships.

create table content_calendar (
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

create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  channel text not null default 'chat', -- chat | consultant
  client_id uuid references clients (id) on delete set null,
  language text default 'en', -- en | ka
  transcript jsonb not null default '[]', -- array of {role, content, ts}
  status text not null default 'open', -- open | qualified | closed
  summary text
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

-- Public site can read content tables directly with the anon key...
create policy "public read projects" on projects for select using (true);
create policy "public read pricing_packages" on pricing_packages for select using (true);
create policy "public read pricing_singles" on pricing_singles for select using (true);
create policy "public read journal_posts" on journal_posts for select using (true);

-- ...but nothing else is anon-readable: clients, engagements, tasks,
-- content_calendar, ai_conversations, and team_members are all
-- service_role (server-side /api) only, and later authenticated-admin-only,
-- once team login is wired up. No policies means no anon access at all.
