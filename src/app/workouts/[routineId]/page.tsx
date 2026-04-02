// app/workouts/[routineId]/page.tsx
import StartWorkoutClient from '@/components/workouts/StartWorkoutClient'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ routineId: string }> }

export default async function WorkoutPage({ params }: Props) {
    const { routineId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return notFound()

    const { data: routine } = await supabase
        .from('routines')
        .select('*, routine_exercises(*, exercise:exercises(id, name, muscle_group))')
        .eq('id', routineId)
        .single()

    if (!routine) return notFound()

    // Trae el último set de cada ejercicio de la rutina
    const exerciseIds = routine.routine_exercises.map(
        (re: { exercise_id: string }) => re.exercise_id
    )
    const { data: lastSets } = await supabase
        .from('session_sets')
        .select('exercise_id, weight_kg, reps, rir, estimated_1rm, session:sessions!inner(date)')
        .in('exercise_id', exerciseIds)
        .eq('session.user_id', user.id)
        .order('created_at', { ascending: false })

    // Agrupa por exercise_id — solo los sets de la sesión más reciente
    const lastSessionByExercise: Record<string, {
        sets: { weightKg: number; reps: number; rir: number }[]
        suggested: number | null
    }> = {}

    for (const exerciseId of exerciseIds) {
        const setsForExercise = (lastSets ?? []).filter(s => s.exercise_id === exerciseId)
        if (!setsForExercise.length) {
            lastSessionByExercise[exerciseId] = { sets: [], suggested: null }
            continue
        }

        // La sesión más reciente es la primera por el order desc
        const mostRecentDate = (Array.isArray(setsForExercise[0].session)
            ? setsForExercise[0].session[0]
            : setsForExercise[0].session)?.date

        const lastSessionSets = setsForExercise
            .filter(s => {
                const session = Array.isArray(s.session) ? s.session[0] : s.session
                return session?.date === mostRecentDate
            })
            .map(s => ({
                weightKg: Number(s.weight_kg),
                reps: s.reps,
                rir: s.rir,
            }))

        // Calcula sugerencia con tu función de progressive overload
        const avgRir = lastSessionSets.reduce((sum, s) => sum + s.rir, 0) / lastSessionSets.length
        const lastWeight = lastSessionSets[0].weightKg

        // Encuentra el rir_target de este ejercicio en la rutina
        const routineExercise = routine.routine_exercises.find((re:{exercise_id: string}) => re.exercise_id === exerciseId)
        const rirTarget = routineExercise?.rir_target ?? 2
        const delta = avgRir - rirTarget

        let suggested = lastWeight
        if (delta >= 2) suggested = Math.round(lastWeight * 1.05 / 2.5) * 2.5
        else if (delta === 1) suggested = Math.round(lastWeight * 1.025 / 2.5) * 2.5
        else if (delta === -1) suggested = Math.round(lastWeight * 0.95 / 2.5) * 2.5
        else if (delta <= -2) suggested = Math.round(lastWeight * 0.90 / 2.5) * 2.5

        lastSessionByExercise[exerciseId] = { sets: lastSessionSets, suggested }
    }

    return (
        <StartWorkoutClient
            routine={routine}
            lastSessionByExercise={lastSessionByExercise}
        />
    )
}