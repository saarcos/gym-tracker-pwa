-- ─── INDEXES ───
-- Las queries más frecuentes de la app

-- "Dame las sesiones de este usuario ordenadas por fecha"
create index idx_sessions_user_date
  on sessions(user_id, date desc);

-- "Dame todos los sets de este ejercicio para este usuario"
create index idx_session_sets_exercise
  on session_sets(exercise_id);

-- "Dame los ejercicios de esta sesión"
create index idx_session_sets_session
  on session_sets(session_id);

-- "Dame los ejercicios de esta rutina en orden"
create index idx_routine_exercises_order
  on routine_exercises(routine_id, sort_order);

-- ─── SEED: EJERCICIOS PREDEFINIDOS ───
-- user_id = null → son del sistema, visibles para todos
insert into exercises (name, muscle_group, type, is_custom) values
  -- Pecho
  ('Bench press (flat)',       'chest',     'compound',  false),
  ('Bench press (incline)',    'chest',     'compound',  false),
  ('Bench press (decline)',    'chest',     'compound',  false),
  ('Dumbbell fly',             'chest',     'isolation', false),
  ('Cable crossover',          'chest',     'isolation', false),
  ('Push-up',                  'chest',     'compound',  false),
  -- Espalda
  ('Deadlift (conventional)',  'back',      'compound',  false),
  ('Pull-up',                  'back',      'compound',  false),
  ('Barbell row',              'back',      'compound',  false),
  ('Seated cable row',         'back',      'compound',  false),
  ('Lat pulldown',             'back',      'compound',  false),
  ('Single-arm dumbbell row',  'back',      'compound',  false),
  ('Face pull',                'back',      'isolation', false),
  -- Hombros
  ('Overhead press (barbell)', 'shoulders', 'compound',  false),
  ('Overhead press (dumbbell)','shoulders', 'compound',  false),
  ('Lateral raise',            'shoulders', 'isolation', false),
  ('Front raise',              'shoulders', 'isolation', false),
  ('Reverse fly',              'shoulders', 'isolation', false),
  -- Bíceps
  ('Barbell curl',             'biceps',    'isolation', false),
  ('Dumbbell curl',            'biceps',    'isolation', false),
  ('Hammer curl',              'biceps',    'isolation', false),
  ('Incline dumbbell curl',    'biceps',    'isolation', false),
  ('Cable curl',               'biceps',    'isolation', false),
  -- Tríceps
  ('Tricep pushdown (cable)',  'triceps',   'isolation', false),
  ('Skull crusher',            'triceps',   'isolation', false),
  ('Overhead tricep extension','triceps',   'isolation', false),
  ('Close-grip bench press',   'triceps',   'compound',  false),
  ('Dips',                     'triceps',   'compound',  false),
  -- Piernas
  ('Squat (barbell)',          'legs',      'compound',  false),
  ('Leg press',                'legs',      'compound',  false),
  ('Romanian deadlift',        'legs',      'compound',  false),
  ('Leg curl (lying)',         'legs',      'isolation', false),
  ('Leg extension',            'legs',      'isolation', false),
  ('Hack squat',               'legs',      'compound',  false),
  ('Bulgarian split squat',    'legs',      'compound',  false),
  ('Walking lunge',            'legs',      'compound',  false),
  ('Calf raise (standing)',    'legs',      'isolation', false),
  ('Calf raise (seated)',      'legs',      'isolation', false),
  -- Glúteos
  ('Hip thrust (barbell)',     'glutes',    'compound',  false),
  ('Cable kickback',           'glutes',    'isolation', false),
  ('Sumo deadlift',            'glutes',    'compound',  false),
  -- Core
  ('Plank',                    'core',      'isolation', false),
  ('Cable crunch',             'core',      'isolation', false),
  ('Ab wheel rollout',         'core',      'isolation', false),
  ('Hanging leg raise',        'core',      'isolation', false);