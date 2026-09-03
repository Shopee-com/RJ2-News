-- ============================================================
-- SPX REVERSA — Esquema sugerido (Supabase / PostgreSQL)
-- Fase futura. A camada src/data/ hoje mocka estas tabelas.
-- ============================================================

-- Perfis de usuário (liga-se ao auth.users do Supabase)
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text,
  region text,
  shift text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Categorias de notícia
create table if not exists news_categories (
  id serial primary key,
  name text unique not null
);

-- Notícias / jornal
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id int references news_categories (id),
  title text not null,
  excerpt text,
  content jsonb,
  image_url text,
  author text,
  author_role text,
  reading_minutes int default 3,
  views int default 0,
  featured boolean default false,
  published_at timestamptz not null default now()
);

-- Categorias de POP
create table if not exists pop_categories (
  id serial primary key,
  name text unique not null
);

-- POPs / procedimentos
create table if not exists pops (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category_id int references pop_categories (id),
  version text,
  owner text,
  status text check (status in ('Vigente', 'Em revisão', 'Arquivado')),
  summary text,
  steps jsonb,
  updated_at timestamptz not null default now()
);

-- Projetos
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  progress int check (progress between 0 and 100),
  owner text,
  status text,
  deadline date,
  last_update timestamptz not null default now()
);

create table if not exists project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

-- Etapas da jornada
create table if not exists journey_steps (
  id uuid primary key default gen_random_uuid(),
  step_order int not null,
  key text unique not null,
  name text not null,
  description text,
  objective text,
  responsibles jsonb,
  related_pop text,
  indicators jsonb,
  best_practices jsonb,
  risks jsonb,
  tools jsonb
);

-- Pessoas / organograma
create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  region text,
  shift text,
  contact text,
  photo_url text,
  level text,
  quote text
);

-- Agenda / eventos
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  mode text check (mode in ('Online', 'Presencial')),
  time text
);

-- Comunicados
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  href text,
  created_at timestamptz not null default now()
);

-- Dashboards
create table if not exists dashboards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  owner text,
  provider text,
  href text,
  updated_at timestamptz not null default now()
);

-- Ferramentas
create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  owner text,
  version text,
  href text
);

-- Vagas
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area text,
  location text,
  model text check (model in ('Presencial', 'Híbrido', 'Remoto')),
  shift text,
  region text,
  summary text,
  posted_at timestamptz not null default now()
);

-- Notificações
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  type text,
  title text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Links rápidos e configurações
create table if not exists quick_links (
  id serial primary key,
  label text not null,
  href text,
  icon text
);

create table if not exists settings (
  key text primary key,
  value jsonb
);
