// src/lib/mock/routines.ts
import type { Tables } from '@/types/database'

export type Routine = Tables<'routines'>
export type RoutineExercise = Tables<'routine_exercises'>
export type Exercise = Tables<'exercises'>

// Tipo combinado — lo que usarás en la UI
// (rutina + sus ejercicios con el nombre del ejercicio incluido)
export type RoutineWithExercises = Routine & {
    routine_exercises: (RoutineExercise & {
        exercise: Pick<Exercise, 'id' | 'name' | 'muscle_group'>
    })[]
}
