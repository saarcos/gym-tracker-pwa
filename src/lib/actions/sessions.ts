"use server";

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveSession(data: {
    routineId: string,
    duration_seconds: number,
    notes: string,
    sets: {
        exerciseId: string,
        setNumber: number,
        weightKg: number,
        reps: number,
        rir: number
    }[]
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    //1. crear la sesión
    const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
            user_id: user.id,
            routine_id: data.routineId,
            date: new Date().toISOString().split('T')[0],
            duration_seconds: data.duration_seconds,
            notes: data.notes,
            completed: true,
        })
        .select()
        .single()
    if (sessionError) throw new Error(sessionError.message)
    //2. Crear los sets de una vez
    if (data.sets.length > 0) {
        const { error: setsError } = await supabase
            .from('session_sets')
            .insert(
                data.sets.map(set => ({
                    session_id: session.id,
                    exercise_id: set.exerciseId,
                    set_number: set.setNumber,
                    weight_kg: set.weightKg,
                    reps: set.reps,
                    rir: set.rir,
                }))
            )

        if (setsError) throw new Error(setsError.message)
    }
    revalidatePath('/history')
    revalidatePath('/')
    redirect('/history')
}

export async function deleteSession(sessionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { ok: false, error: 'Not authenticated' }
    }

    const { error: setsError } = await supabase
        .from('session_sets')
        .delete()
        .eq('session_id', sessionId)

    if (setsError) {
        return { ok: false, error: setsError.message }
    }

    const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id)

    if (sessionError) {
        return { ok: false, error: sessionError.message }
    }

    revalidatePath('/history')
    revalidatePath('/')

    return { ok: true }
}
