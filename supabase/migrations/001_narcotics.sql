-- ============================================================
-- FieldDose narcotics chain-of-custody — phase one schema
-- Patient-free by design: drugs, quantities, lots, seals,
-- signatures, timestamps. No patient identifiers, ever (PHI line).
--
-- Apply: Supabase dashboard → SQL Editor → paste → Run.
-- Idempotent-ish: safe to re-run only on a fresh database.
-- ============================================================

-- ---------- agencies ----------
create table public.agencies (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,          -- enrollment code, e.g. GNFR2026
  name           text not null,
  short_name     text,
  timezone       text not null default 'America/New_York',
  transfer_mode  text not null default 'seal' check (transfer_mode in ('seal','keys')),
  -- Minimum retention for custody records. Pending medical-direction
  -- answer (Q7.1). NOTE: phase one never auto-deletes — this documents
  -- the floor, it does not drive a purge job.
  retention_days integer not null default 730,
  created_at     timestamptz not null default now()
);

-- ---------- memberships (user <-> agency + role) ----------
create table public.memberships (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  agency_id    uuid not null references public.agencies(id) on delete cascade,
  role         text not null default 'medic' check (role in ('medic','officer','admin')),
  display_name text not null,                   -- e.g. "S. Smith #221"
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (user_id, agency_id)
);
create index memberships_user_idx   on public.memberships (user_id) ;
create index memberships_agency_idx on public.memberships (agency_id);

-- ---------- helpers ----------
-- Agencies the signed-in user belongs to. SECURITY DEFINER so RLS
-- policies can call it without recursing into memberships' own RLS.
create or replace function public.my_agency_ids()
returns setof uuid
language sql stable security definer
set search_path = public
as $$
  select agency_id from public.memberships
  where user_id = auth.uid() and active
$$;

create or replace function public.is_agency_admin(a uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid() and agency_id = a and active and role = 'admin'
  )
$$;

revoke execute on function public.my_agency_ids() from anon;
revoke execute on function public.is_agency_admin(uuid) from anon;

-- ---------- narc_items (inventory lines) ----------
create table public.narc_items (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references public.agencies(id) on delete cascade,
  unit        text not null,                    -- "MED 71 · Box 2"
  drug        text not null,                    -- "Fentanyl 100 mcg / 2 mL"
  qty         integer not null default 0 check (qty >= 0),
  lot         text,
  expires_on  date,
  mg_per_unit numeric,                          -- for min/max mg checks
  active      boolean not null default true,    -- soft delete only
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index narc_items_agency_idx on public.narc_items (agency_id, active);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger narc_items_touch before update on public.narc_items
for each row execute function public.touch_updated_at();

-- ---------- transfers (daily sign-over) — IMMUTABLE ----------
create table public.transfers (
  id             uuid primary key default gen_random_uuid(),
  agency_id      uuid not null references public.agencies(id) on delete cascade,
  unit           text not null,
  mode           text not null check (mode in ('seal','keys')),
  old_seal       text,                          -- seal mode
  new_seal       text,
  from_name      text not null,                 -- relinquishing (signs as witness)
  to_name        text not null,                 -- assuming custody
  from_user      uuid references auth.users(id),
  to_user        uuid references auth.users(id),
  items          jsonb not null check (jsonb_typeof(items) = 'array'),
  attestation    text,                          -- keys-mode inspection statement
  from_signature text,                          -- data-URL PNG
  to_signature   text,
  device_id      text,
  occurred_at    timestamptz not null default now(),
  created_at     timestamptz not null default now()
);
create index transfers_agency_time_idx on public.transfers (agency_id, occurred_at desc);

-- ---------- narc_events (use / waste / restock / adjust) — IMMUTABLE ----------
create table public.narc_events (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references public.agencies(id) on delete cascade,
  kind        text not null check (kind in ('use','waste','restock','adjust')),
  drug        text not null,
  amount_mg   numeric,
  qty         integer,
  witness     text,
  note        text,
  by_name     text not null,
  by_user     uuid references auth.users(id),
  occurred_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index narc_events_agency_time_idx on public.narc_events (agency_id, occurred_at desc);

-- ============================================================
-- ROW LEVEL SECURITY — everything scoped to agency membership.
-- Chain-of-custody tables (transfers, narc_events) have NO update
-- or delete policies for anyone: once written, a record is
-- permanent. Corrections are new 'adjust' events, never edits.
-- ============================================================
alter table public.agencies    enable row level security;
alter table public.memberships enable row level security;
alter table public.narc_items  enable row level security;
alter table public.transfers   enable row level security;
alter table public.narc_events enable row level security;

-- agencies: members read their own agency; nobody writes from the client
create policy agencies_select on public.agencies
  for select to authenticated
  using (id in (select public.my_agency_ids()));

-- memberships: read your own rows + everyone in your agencies (roster);
-- only admins manage the roster
create policy memberships_select on public.memberships
  for select to authenticated
  using (user_id = auth.uid() or agency_id in (select public.my_agency_ids()));
create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (public.is_agency_admin(agency_id));
create policy memberships_update on public.memberships
  for update to authenticated
  using (public.is_agency_admin(agency_id))
  with check (public.is_agency_admin(agency_id));

-- narc_items: members read + write within their agency; no hard delete
-- (deactivate with active = false)
create policy narc_items_select on public.narc_items
  for select to authenticated
  using (agency_id in (select public.my_agency_ids()));
create policy narc_items_insert on public.narc_items
  for insert to authenticated
  with check (agency_id in (select public.my_agency_ids()));
create policy narc_items_update on public.narc_items
  for update to authenticated
  using (agency_id in (select public.my_agency_ids()))
  with check (agency_id in (select public.my_agency_ids()));

-- transfers: members read + append within their agency; recorder must
-- be signed in. No update/delete policies — immutable.
create policy transfers_select on public.transfers
  for select to authenticated
  using (agency_id in (select public.my_agency_ids()));
create policy transfers_insert on public.transfers
  for insert to authenticated
  with check (agency_id in (select public.my_agency_ids()));

-- narc_events: same shape as transfers
create policy narc_events_select on public.narc_events
  for select to authenticated
  using (agency_id in (select public.my_agency_ids()));
create policy narc_events_insert on public.narc_events
  for insert to authenticated
  with check (agency_id in (select public.my_agency_ids()));

-- ============================================================
-- SEED — GNFR (matches public/packs/GNFR2026.json)
-- ============================================================
insert into public.agencies (code, name, short_name, timezone, transfer_mode)
values ('GNFR2026', 'Greater Naples Fire Rescue', 'GNFR', 'America/New_York', 'keys')
on conflict (code) do nothing;
