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

// ─── Mock data ───

export const mockRoutines: RoutineWithExercises[] = [
    {
        id: 'routine-1',
        user_id: 'user-1',
        name: 'Upper A',
        days: ['monday', 'thursday'],
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        routine_exercises: [
            {
                id: 're-1',
                routine_id: 'routine-1',
                exercise_id: 'ex-1',
                sets_target: 4,
                reps_target: 8,
                rir_target: 2,
                rest_seconds: 120,
                sort_order: 0,
                created_at: '2024-01-01T00:00:00Z',
                exercise: { id: 'ex-1', name: 'Bench press (flat)', muscle_group: 'chest' },
            },
            {
                id: 're-2',
                routine_id: 'routine-1',
                exercise_id: 'ex-2',
                sets_target: 3,
                reps_target: 10,
                rir_target: 2,
                rest_seconds: 90,
                sort_order: 1,
                created_at: '2024-01-01T00:00:00Z',
                exercise: { id: 'ex-2', name: 'Overhead press', muscle_group: 'shoulders' },
            },
            {
                id: 're-3',
                routine_id: 'routine-1',
                exercise_id: 'ex-3',
                sets_target: 3,
                reps_target: 12,
                rir_target: 1,
                rest_seconds: 60,
                sort_order: 2,
                created_at: '2024-01-01T00:00:00Z',
                exercise: { id: 'ex-3', name: 'Cable fly', muscle_group: 'chest' },
            },
        ],
    },
    {
        id: 'routine-2',
        user_id: 'user-1',
        name: 'Upper B',
        days: ['tuesday', 'friday'],
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        routine_exercises: [
            {
                id: 're-4',
                routine_id: 'routine-2',
                exercise_id: 'ex-4',
                sets_target: 4,
                reps_target: 6,
                rir_target: 1,
                rest_seconds: 180,
                sort_order: 0,
                created_at: '2024-01-01T00:00:00Z',
                exercise: { id: 'ex-4', name: 'Barbell row', muscle_group: 'back' },
            },
            {
                id: 're-5',
                routine_id: 'routine-2',
                exercise_id: 'ex-5',
                sets_target: 3,
                reps_target: 10,
                rir_target: 2,
                rest_seconds: 90,
                sort_order: 1,
                created_at: '2024-01-01T00:00:00Z',
                exercise: { id: 'ex-5', name: 'Pull-up', muscle_group: 'back' },
            },
        ],
    },
    {
        id: 'routine-3',
        user_id: 'user-1',
        name: 'Lower A',
        days: ['wednesday', 'saturday'],
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        routine_exercises: [
            {
                id: 're-6',
                routine_id: 'routine-3',
                exercise_id: 'ex-6',
                sets_target: 4,
                reps_target: 6,
                rir_target: 1,
                rest_seconds: 180,
                sort_order: 0,
                created_at: '2024-01-01T00:00:00Z',
                exercise: { id: 'ex-6', name: 'Squat (barbell)', muscle_group: 'legs' },
            },
        ],
    },
    {
        id: 'routine-4',
        user_id: 'user-1',
        name: 'Full body',
        days: [],
        is_active: false,
        created_at: '2024-01-01T00:00:00Z',
        routine_exercises: [],
    },
]

// Helper — filtra activas e inactivas
export const mockActiveRoutines = mockRoutines.filter(r => r.is_active)
export const mockInactiveRoutines = mockRoutines.filter(r => !r.is_active)

// Mock para la pantalla de creación/edición — ejercicios disponibles para agregar
export const mockAvailableExercises: Pick<Exercise, 'id' | 'name' | 'muscle_group' | 'type'>[] = [
    { id: 'ex-1', name: 'Bench press (flat)', muscle_group: 'chest', type: 'compound' },
    { id: 'ex-2', name: 'Overhead press', muscle_group: 'shoulders', type: 'compound' },
    { id: 'ex-3', name: 'Cable fly', muscle_group: 'chest', type: 'isolation' },
    { id: 'ex-4', name: 'Barbell row', muscle_group: 'back', type: 'compound' },
    { id: 'ex-5', name: 'Pull-up', muscle_group: 'back', type: 'compound' },
    { id: 'ex-6', name: 'Squat (barbell)', muscle_group: 'legs', type: 'compound' },
    { id: 'ex-7', name: 'Romanian deadlift', muscle_group: 'legs', type: 'compound' },
    { id: 'ex-8', name: 'Lateral raise', muscle_group: 'shoulders', type: 'isolation' },
    { id: 'ex-9', name: 'Barbell curl', muscle_group: 'biceps', type: 'isolation' },
    { id: 'ex-10', name: 'Tricep pushdown (cable)', muscle_group: 'triceps', type: 'isolation' },
    { id: 'ex-11', name: 'Hip thrust (barbell)', muscle_group: 'glutes', type: 'compound' },
    { id: 'ex-12', name: 'Face pull', muscle_group: 'back', type: 'isolation' },
]