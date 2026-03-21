import type { Tables } from '@/types/database'

// Tipos helpers — los mismos que usarás con Supabase real
export type Routine = Tables<'routines'>
export type Session = Tables<'sessions'>
export type SessionSet = Tables<'session_sets'>
export type Exercise = Tables<'exercises'>

// ─── Mock data ───

export const mockTodayRoutine: Routine = {
    id: 'routine-1',
    user_id: 'user-1',
    name: 'Upper A',
    days: ['monday', 'thursday'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
}

export const mockWeeklyStats = {
    sessions: 3,
    volumeKg: 12400,
    prs: 2,
    avgRir: 1.4,
}

export const mockRecentPRs: Array<{ exercise: string; weightKg: number; date: string }> = [
    { exercise: 'Bench press (flat)', weightKg: 95, date: '2024-03-15' },
    { exercise: 'Barbell squat', weightKg: 120, date: '2024-03-13' },
    { exercise: 'Deadlift (conventional)', weightKg: 160, date: '2024-03-10' },
]