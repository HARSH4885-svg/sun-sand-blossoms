-- Sun, Sand & Blossoms: initial schema. Run in Supabase SQL Editor (or `supabase db push`).

create extension if not exists pgcrypto;

-- Organizers allowed into /admin (matched on the signed-in user's email).
create table if not exists public.admin_users (
  email text primary key
);
alter table public.admin_users enable row level security;
-- No policies: nobody can read or write this table through the API.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  look_no bigint generated always as identity,
  full_name text not null check (char_length(full_name) between 2 and 80),
  enrollment_number text not null check (enrollment_number ~ '^[A-Za-z0-9]{5,20}$'),
  email text not null check (char_length(email) <= 120),
  branch text check (char_length(branch) <= 60),
  caption text check (char_length(caption) <= 140),
  image_paths text[] not null check (cardinality(image_paths) between 1 and 2),
  public_consent boolean not null default false,
  own_photo_confirmed boolean not null check (own_photo_confirmed),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

-- Duplicate protection (case-insensitive), enforced by the database.
create unique index if not exists submissions_enrollment_uq on public.submissions (upper(enrollment_number));
create unique index if not exists submissions_email_uq on public.submissions (lower(email));
create index if not exists submissions_status_idx on public.submissions (status, created_at desc);

alter table public.submissions enable row level security;

-- Anonymous visitors get NO direct access. Inserts go through
-- server routes using the service role, which only ever returns approved + consented rows.
revoke all on public.submissions from anon, authenticated;
grant select on public.submissions to authenticated;
grant update (status, reviewed_at, reviewed_by) on public.submissions to authenticated;

drop policy if exists "admins read submissions" on public.submissions;
create policy "admins read submissions" on public.submissions
  for select to authenticated using (public.is_admin());

drop policy if exists "admins moderate submissions" on public.submissions;
create policy "admins moderate submissions" on public.submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Private storage bucket. Images are only reachable through short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins read submission photos" on storage.objects;
create policy "admins read submission photos" on storage.objects
  for select to authenticated using (bucket_id = 'submissions' and public.is_admin());
-- No insert/update/delete policies: uploads happen server-side with the service role.

-- Judging is separate from collection and unused until organizers enable it.
create table if not exists public.judge_scores (
  submission_id uuid not null references public.submissions (id) on delete cascade,
  judge_email text not null,
  score smallint not null check (score between 1 and 10),
  created_at timestamptz not null default now(),
  primary key (submission_id, judge_email)
);
alter table public.judge_scores enable row level security;
revoke all on public.judge_scores from anon, authenticated;
grant select, insert, update on public.judge_scores to authenticated;
drop policy if exists "admins manage scores" on public.judge_scores;
create policy "admins manage scores" on public.judge_scores
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- After creating your organizer account in Supabase Auth, allow it:
-- insert into public.admin_users (email) values ('organizer@iiita.ac.in');
