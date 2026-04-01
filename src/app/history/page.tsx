// src/app/history/page.tsx
import HistoryClient from '@/components/history/HistoryClient'
import { createClient } from '@/utils/supabase/server'

// El tipo que le pasas al componente
export type SessionWithStats = {
    id: string
    date: string
    routineName: string
    durationMinutes: number | null
    totalSets: number
    totalVolumeKg: number
}

export default async function HistoryPage() {
    const useMockSessions = false
    const supabase = await createClient()

    const { data: sessions } = await supabase
        .from('sessions')
        .select(`
            id,
            date,
            duration_seconds,
            completed,
            routine:routines!sessions_routine_id_fkey(name),
            session_sets(
                id,
                weight_kg,
                reps
            )
        `)
        .eq('completed', true)
        .order('date', { ascending: false })

    const sessionsWithStats: SessionWithStats[] = (sessions ?? []).map(session => {
        // Supabase devuelve la relación como array — tomamos el primero
        const routine = Array.isArray(session.routine)
            ? session.routine[0]
            : session.routine

        return {
            id: session.id,
            date: session.date,
            routineName: routine?.name ?? 'Free workout',
            durationMinutes: session.duration_seconds
                ? Math.round(session.duration_seconds / 60)
                : null,
            totalSets: session.session_sets.length,
            totalVolumeKg: session.session_sets.reduce(
                (sum, set) => sum + (Number(set.weight_kg) * set.reps), 0
            ),
        }
    })

    const mockSessions: SessionWithStats[] = [
        {
            id: 'mock-1',
            date: '2026-03-26', // Semana del 23-29 Mar
            routineName: 'Push Day',
            durationMinutes: 58,
            totalSets: 18,
            totalVolumeKg: 6420,
        },
        {
            id: 'mock-2',
            date: '2026-03-24', // Semana del 23-29 Mar
            routineName: 'Leg Day',
            durationMinutes: 64,
            totalSets: 20,
            totalVolumeKg: 9100,
        },
        {
            id: 'mock-3',
            date: '2026-03-17', // Semana del 16-22 Mar
            routineName: 'Pull Day',
            durationMinutes: 52,
            totalSets: 16,
            totalVolumeKg: 5875,
        },
        {
            id: 'mock-4',
            date: '2026-03-10', // Semana del 09-15 Mar
            routineName: 'Upper Body',
            durationMinutes: 47,
            totalSets: 14,
            totalVolumeKg: 4980,
        },
        {
            id: 'mock-5',
            date: '2026-02-28', // Semana del 23 Feb-01 Mar
            routineName: 'Full Body',
            durationMinutes: 71,
            totalSets: 22,
            totalVolumeKg: 10120,
        },
    ]

    const sessionsToRender = useMockSessions ? mockSessions : sessionsWithStats

    return <HistoryClient sessions={sessionsToRender} />
}
