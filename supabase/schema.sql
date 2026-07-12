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

-- ── New tables (don't exist as code today) ──────────────────────────────

create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  source text not null default 'contact_form', -- contact_form | ai_consultant | ai_chat
  name text,
  email text,
  phone text,
  message text,
  status text not null default 'new', -- new | contacted | proposal | won | lost
  meta jsonb default '{}' -- e.g. consultant quiz answers
);

-- Team accounts ride on Supabase's built-in auth.users; this table just
-- adds the fields auth.users doesn't have (role, display name).
create table team_members (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  role text not null default 'member', -- admin | member
  created_at timestamptz default now()
);

-- ── Row-level security ───────────────────────────────────────────────────
-- All API writes go through /api serverless functions using the
-- service_role key, which bypasses RLS entirely — these policies only
-- govern what the browser's anon key is allowed to touch directly.

alter table projects enable row level security;
alter table pricing_packages enable row level security;
alter table pricing_singles enable row level security;
alter table journal_posts enable row level security;
alter table leads enable row level security;
alter table team_members enable row level security;

-- Public site can read content tables directly with the anon key...
create policy "public read projects" on projects for select using (true);
create policy "public read pricing_packages" on pricing_packages for select using (true);
create policy "public read pricing_singles" on pricing_singles for select using (true);
create policy "public read journal_posts" on journal_posts for select using (true);

-- ...but nobody gets leads or team_members via the anon key — those are
-- service_role (server-side /api) only, and authenticated admin reads,
-- once auth is wired up.
