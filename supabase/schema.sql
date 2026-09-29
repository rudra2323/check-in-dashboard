-- Check-In Desk — physicians schema (Liaison Lunch + Speed Mentoring)
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / drop-then-create for policies.

create extension if not exists "pgcrypto";

create table if not exists public.physicians (
  id uuid primary key default gen_random_uuid(),

  -- Which event this row belongs to. A physician attending both events
  -- gets two rows (one per event), since the fields differ per event.
  event_type text not null check (event_type in ('liaison_lunch', 'speed_mentoring')),

  name text not null, -- store without the "Dr." prefix; the UI adds it

  -- Speed Mentoring fields
  specialty text,        -- e.g. "Cardiology"
  specialty_table text,  -- the one table they're stationed at all event

  -- Liaison Lunch fields
  rotation_tables text,  -- tables they rotate through, e.g. "Table 2, Table 4, Table 6"
  designated_seat text,  -- their one "home" seat, e.g. "Table 3, Seat 5"

  -- Shared across both events
  descriptor text,       -- free-text notes to identify them later (e.g. "navy blazer, glasses")
  photo_url text,        -- public URL from the physician-photos storage bucket

  checked_in boolean not null default false,
  thank_you_card_given boolean not null default false,

  created_at timestamptz not null default now()
);

create index if not exists physicians_event_checkedin_idx on public.physicians (event_type, checked_in, created_at);

-- Realtime: stream every insert/update/delete to subscribed clients.
alter publication supabase_realtime add table public.physicians;

-- Row Level Security
-- Open policies for a kiosk-style demo using the public anon key. Before a
-- real event with real attendee/photo data, restrict this (e.g. require
-- event-staff auth) rather than leaving reads/writes public.
alter table public.physicians enable row level security;

drop policy if exists "Public can read physicians" on public.physicians;
create policy "Public can read physicians"
  on public.physicians for select
  using (true);

drop policy if exists "Public can insert physicians" on public.physicians;
create policy "Public can insert physicians"
  on public.physicians for insert
  with check (true);

drop policy if exists "Public can update physicians" on public.physicians;
create policy "Public can update physicians"
  on public.physicians for update
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- Storage bucket for physician photos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('physician-photos', 'physician-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read physician photos" on storage.objects;
create policy "Public read physician photos"
  on storage.objects for select
  using (bucket_id = 'physician-photos');

drop policy if exists "Public upload physician photos" on storage.objects;
create policy "Public upload physician photos"
  on storage.objects for insert
  with check (bucket_id = 'physician-photos');

-- Roster data lives in supabase/roster.sql (run it after this file).
