-- Activar RLS en todas las tablas
alter table exercises        enable row level security;
alter table routines         enable row level security;
alter table routine_exercises enable row level security;
alter table sessions         enable row level security;
alter table session_sets     enable row level security;

-- ─── EXERCISES ───
-- Ver: ejercicios del sistema (user_id null) + los propios
create policy "exercises_select" on exercises for select
  using (user_id is null or user_id = auth.uid());

-- Crear/editar/borrar: solo los propios
create policy "exercises_insert" on exercises for insert
  with check (user_id = auth.uid());

create policy "exercises_update" on exercises for update
  using (user_id = auth.uid());

create policy "exercises_delete" on exercises for delete
  using (user_id = auth.uid());

-- ─── ROUTINES ───
create policy "routines_all" on routines for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─── ROUTINE_EXERCISES ───
-- El acceso se valida a través de la rutina (que ya tiene RLS)
create policy "routine_exercises_all" on routine_exercises for all
  using (
    exists (
      select 1 from routines
      where routines.id = routine_exercises.routine_id
        and routines.user_id = auth.uid()
    )
  );

-- ─── SESSIONS ───
create policy "sessions_all" on sessions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─── SESSION_SETS ───
create policy "session_sets_all" on session_sets for all
  using (
    exists (
      select 1 from sessions
      where sessions.id = session_sets.session_id
        and sessions.user_id = auth.uid()
    )
  );