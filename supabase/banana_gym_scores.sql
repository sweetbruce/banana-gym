create table if not exists public.banana_gym_scores (
  id uuid primary key default gen_random_uuid(),
  score_key text not null,
  score_type text not null check (score_type in ('time_trial', 'drill')),
  label text not null,
  duration_seconds integer not null check (duration_seconds in (90, 120, 300)),
  score integer not null check (score >= 0 and score <= 100000),
  tie_break integer not null default 0 check (tie_break >= 0 and tie_break <= 100000),
  display_score text not null,
  player_name text not null,
  player_emoji text,
  words integer not null default 0,
  letters integer not null default 0,
  invalid integer not null default 0,
  hooks integer not null default 0,
  crosses integer not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists banana_gym_scores_top_idx
  on public.banana_gym_scores (score_key, score desc, tie_break desc, created_at asc);

alter table public.banana_gym_scores enable row level security;

grant select, insert on public.banana_gym_scores to anon;

drop policy if exists "Anyone can read banana gym scores" on public.banana_gym_scores;
create policy "Anyone can read banana gym scores"
  on public.banana_gym_scores
  for select
  to anon
  using (true);

drop policy if exists "Anyone can submit banana gym scores" on public.banana_gym_scores;
create policy "Anyone can submit banana gym scores"
  on public.banana_gym_scores
  for insert
  to anon
  with check (
    score_key ~ '^(trial|drill):[A-Za-z0-9_-]+(:[A-Za-z0-9_-]+)*:[0-9]+$'
    and player_name ~ '^[A-Z0-9]{1,10}$'
    and char_length(label) between 1 and 80
    and char_length(display_score) between 1 and 24
    and (player_emoji is null or char_length(player_emoji) <= 8)
  );
