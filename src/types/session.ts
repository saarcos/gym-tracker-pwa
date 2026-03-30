import type { Tables } from '@/types/database'
export type Session = Tables<'sessions'>
export type SessionSet = Tables<'session_sets'>
export type Sets = SessionSet

type SessionHistorySet = Pick<SessionSet, 'id' | 'weight_kg' | 'reps'>
type SessionHistoryRoutine = Pick<Tables<'routines'>, 'name'>

export type SessionWithSets = Pick<
    Session,
    'id' | 'date' | 'duration_seconds' | 'completed'
> & {
    routine: SessionHistoryRoutine | null
    session_sets: SessionHistorySet[]
}
