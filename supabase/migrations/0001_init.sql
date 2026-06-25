-- =====================================================================
-- 니냥내냥 (PetDex) — MVP 초기 스키마
-- Supabase Postgres. 등급/스탯은 규칙기반 엔진이 캡처 시점에 산출해 저장(deterministic).
-- 배경 팝아트 템플릿은 코드(SVG/CSS)에 두고 DB엔 키(bg_theme)만 저장.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type animal_type  as enum ('cat','dog','other');          -- 전 동물 확장 대비
create type rarity        as enum ('common','uncommon','rare','epic','legendary');
create type time_of_day   as enum ('dawn','day','sunset','night');
create type weather       as enum ('clear','cloudy','rain','snow','fog');
create type trade_status  as enum ('pending','accepted','declined','cancelled');

-- ---------- profiles ----------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text,
  avatar_url  text,
  xp          integer not null default 0,
  level       integer not null default 1,
  churu       integer not null default 5,   -- 미끼(츄르) 재화
  coins       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 도감 일련번호 시퀀스 (#000014)
create sequence dex_seq start 1;

-- ---------- cat_cards (수집 카드) ----------
create table cat_cards (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references profiles(id) on delete cascade,
  dex_no       bigint not null default nextval('dex_seq'),
  name         text,                          -- 별명
  animal_type  animal_type not null default 'cat',

  -- 이미지 (Supabase Storage 'cards' 버킷 경로)
  photo_url    text not null,                 -- 원본
  cutout_url   text,                          -- 누끼(투명 png)

  -- 분류/등급 (규칙기반 엔진 산출)
  rarity       rarity not null,
  tribe        text,                          -- 털색/부족: 치즈냥, 고등어, 턱시도 ...
  stats        jsonb  not null default '{}'::jsonb,  -- {cuteness,chonky,friendliness,charisma}
  ability_text text,

  -- 배경/캐치 맥락
  bg_theme     text,                          -- 팝아트 배경 템플릿 키 (sunset, alley, snow ...)
  region       text,                          -- 동네(대략/마스킹)
  lat          double precision,
  lng          double precision,
  captured_at  timestamptz not null default now(),
  time_of_day  time_of_day,
  weather      weather,
  season       text,

  -- 메타
  intimacy     integer not null default 1,    -- 친밀도(같은 냥 재발견 시 ↑)
  is_favorite  boolean not null default false,
  created_at   timestamptz not null default now()
);
create index cat_cards_owner_idx  on cat_cards (owner_id);
create index cat_cards_rarity_idx on cat_cards (rarity);

-- ---------- friendships (냥체인지용) ----------
create table friendships (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references profiles(id) on delete cascade,
  addressee_id  uuid not null references profiles(id) on delete cascade,
  status        text not null default 'pending',  -- pending/accepted/blocked
  created_at    timestamptz not null default now(),
  unique (requester_id, addressee_id)
);

-- ---------- trades (냥체인지: 카드↔카드, 현금 없음) ----------
create table trades (
  id                 uuid primary key default gen_random_uuid(),
  from_user          uuid not null references profiles(id) on delete cascade,
  to_user            uuid not null references profiles(id) on delete cascade,
  offered_card_id    uuid not null references cat_cards(id) on delete cascade,
  requested_card_id  uuid references cat_cards(id) on delete set null,  -- null이면 선물
  status             trade_status not null default 'pending',
  created_at         timestamptz not null default now(),
  resolved_at        timestamptz
);
create index trades_from_idx on trades (from_user);
create index trades_to_idx   on trades (to_user);

-- ---------- triggers ----------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_profiles_updated
  before update on profiles
  for each row execute function set_updated_at();

-- 신규 가입 → profile 자동 생성
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- RLS ----------
alter table profiles    enable row level security;
alter table cat_cards   enable row level security;
alter table friendships enable row level security;
alter table trades      enable row level security;

create policy "profile self read"   on profiles for select using (auth.uid() = id);
create policy "profile self update" on profiles for update using (auth.uid() = id);

create policy "cards owner all" on cat_cards for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
-- NOTE: 냥체인지에서 친구 도감 열람은 별도 정책/뷰로 추후 추가(현재는 본인만).

create policy "friendships mine" on friendships for all
  using (auth.uid() = requester_id or auth.uid() = addressee_id)
  with check (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "trades mine" on trades for all
  using (auth.uid() = from_user or auth.uid() = to_user)
  with check (auth.uid() = from_user or auth.uid() = to_user);

-- =====================================================================
-- 추후(미포함): physical_orders(실물주문), donations(길냥이 후원),
--   dex_sets(도감 세트), behavioral_signals(학습), embedding(RAG)
-- =====================================================================
