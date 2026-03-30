import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, Clock, Dumbbell, Layers } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page({
    params,
}: {
    params: Promise<{ sessionId: string }>
}) {
    const { sessionId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return notFound()

    const { data: session, error } = await supabase
        .from('sessions')
        .select(`
            id,
            date,
            duration_seconds,
            notes,
            created_at,
            routine:routines(name),
            session_sets(
                id,
                set_number,
                weight_kg,
                reps,
                rir,
                estimated_1rm,
                exercise:exercises(id, name, muscle_group)
            )
        `)
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .order('set_number', { referencedTable: 'session_sets', ascending: true })
        .single()

    if (error || !session) return notFound()

    // Agrupa los sets por ejercicio antes de pasarlos a la UI
    const exercisesWithSets = Object.values(
        session.session_sets.reduce((groups, set) => {
            // Cast para decirle a TypeScript que es un objeto, no un array
            const exercise = Array.isArray(set.exercise)
                ? set.exercise[0]
                : set.exercise

            const exerciseId = exercise.id

            if (!groups[exerciseId]) {
                groups[exerciseId] = {
                    id: exercise.id,
                    name: exercise.name,
                    muscleGroup: exercise.muscle_group,
                    sets: [],
                }
            }

            groups[exerciseId].sets.push({
                setNumber: set.set_number,
                weightKg: Number(set.weight_kg),
                reps: set.reps,
                rir: set.rir,
                estimated1rm: Number(set.estimated_1rm),
            })

            return groups
        }, {} as Record<string, {
            id: string,
            name: string
            muscleGroup: string
            sets: {
                setNumber: number
                weightKg: number
                reps: number
                rir: number
                estimated1rm: number
            }[]
        }>)
    )

    const routine = Array.isArray(session.routine)
        ? session.routine[0]
        : session.routine

    const sessionData = {
        id: session.id,
        date: session.date,
        routineName: routine?.name ?? 'Free workout',
        durationMinutes: session.duration_seconds
            ? Math.round(session.duration_seconds / 60)
            : null,
        notes: session.notes,
        createdAt: session.created_at,
        totalSets: session.session_sets.length,
        totalVolumeKg: session.session_sets.reduce(
            (sum, set) => sum + (Number(set.weight_kg) * set.reps), 0
        ),
        exercises: exercisesWithSets,
    }

    return <div className="flex flex-col gap-6 min-h-screen px-6 pt-8 pb-32">
        <Link href={"/history"} className="flex items-center gap-2">
            <ArrowLeft className="text-content-primary" />
            <h1 className="text-accent text-xl font-bold">History</h1>
        </Link>
        <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-content-primary">{sessionData.routineName}</h1>
            <div className="flex items-center text-on-secondary-container text-sm gap-2">
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {sessionData.durationMinutes} min
                </div>
                <div className="flex items-center gap-1">
                    <Layers className="w-4 h-4" />
                    {sessionData.totalSets} sets
                </div>
                <div className="flex items-center gap-1">
                    <Dumbbell className="w-4 h-4" />
                    {sessionData.totalVolumeKg} kg
                </div>
            </div>
        </div>
        <div className="flex flex-col gap-7">
            {sessionData.exercises.map((exercise) => (
                <div key={exercise.id} className="flex flex-col gap-2 items-start">
                    <span className="px-2 py-0.5 bg-surface-container-high text-accent text-[0.6rem] font-bold uppercase tracking-widest rounded-none">{exercise.muscleGroup}</span>
                    <div className="flex items-center justify-between w-full">
                        <p className="text-lg font-semibold text-content-primary">{exercise.name}</p>
                        <p className="text-lg font-bold text-accent">Details</p>
                    </div>
                    <table className="w-full text-left bg-surface-container-low rounded-lg overflow-hidden text-content-primary">
                        <thead className="bg-surface-container-high">
                            <tr className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-secondary-container/70">
                                <th className="py-3 pl-4">Set</th>
                                <th className="py-3">kg</th>
                                <th className="py-3">Reps</th>
                                <th className="py-3">RIR</th>
                                <th className="py-3 pr-4 text-right">1RM</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
                            {exercise.sets.map((set, idx) => (
                                <tr
                                    key={idx}
                                    className="hover:bg-surface-container transition-colors text-xs"
                                >
                                    <td className="py-3 pl-4 font-bold text-accent">
                                        {idx + 1}
                                    </td>
                                    <td className="py-3 font-medium">
                                        {set.weightKg}
                                    </td>
                                    <td className="py-3 font-medium">
                                        {set.reps}
                                    </td>
                                    <td className="py-3 font-medium">
                                        {set.rir}
                                    </td>
                                    <td className="py-3 pr-4 text-right text-accent">
                                        {set.estimated1rm}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    </div>
}