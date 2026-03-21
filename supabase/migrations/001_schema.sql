-- Habilitar extensión para UUIDs
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- EXERCISES
-- Tabla compartida: ejercicios del sistema (user_id = null)
-- y ejercicios custom del usuario (user_id = su id)
-- ─────────────────────────────────────────
create table exercises (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  name         text not null,
  muscle_group text not null check (muscle_group in (
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'legs', 'glutes', 'core', 'cardio', 'other'
  )),
  type         text not null check (type in ('compound', 'isolation')),
  is_custom    boolean not null default false,
  created_at   timestamptz not null default now(),

  -- Un usuario no puede tener dos ejercicios con el mismo nombre
  unique (user_id, name)
);

-- ─────────────────────────────────────────
-- ROUTINES
-- ─────────────────────────────────────────
create table routines (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  days       text[] not null default '{}', -- ['monday', 'wednesday']
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- ROUTINE_EXERCISES
-- Tabla de unión con configuración por ejercicio
-- ─────────────────────────────────────────
create table routine_exercises (
  id           uuid primary key default gen_random_uuid(),
  routine_id   uuid not null references routines(id) on delete cascade,
  exercise_id  uuid not null references exercises(id) on delete restrict,
  sets_target  int not null default 3 check (sets_target > 0),
  reps_target  int not null default 8 check (reps_target > 0),
  rir_target   int not null default 2 check (rir_target >= 0 and rir_target <= 5),
  rest_seconds int not null default 120 check (rest_seconds > 0),
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- SESSIONS
-- Una sesión = un entrenamiento completo
-- ─────────────────────────────────────────
create table sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  routine_id       uuid references routines(id) on delete set null,
  date             date not null default current_date,
  duration_seconds int check (duration_seconds > 0),
  completed        boolean not null default false,
  notes            text,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- SESSION_SETS
-- El registro real de cada set ejecutado
-- ─────────────────────────────────────────
create table session_sets (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references sessions(id) on delete cascade,
  exercise_id    uuid not null references exercises(id) on delete restrict,
  set_number     int not null check (set_number > 0),
  weight_kg      numeric(6,2) not null check (weight_kg >= 0),
  reps           int not null check (reps > 0),
  rir            int not null check (rir >= 0 and rir <= 10),
  estimated_1rm  numeric(6,2) generated always as
                   (weight_kg * (1.0 + reps::numeric / 30.0)) stored,
  created_at     timestamptz not null default now(),

  -- No puede haber dos sets con el mismo número en el mismo ejercicio+sesión
  unique (session_id, exercise_id, set_number)
);