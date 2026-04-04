'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'



// ─── Crear rutina ───
export async function createRoutine(formData: {
    name: string
    days: string[]
    is_active: boolean
    exercises: {
        exercise_id: string
        sets_target: number
        reps_target: number
        rir_target: number
        rest_seconds: number
        sort_order: number
    }[]
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Insertar la rutina primero
    const { data: routine, error: routineError } = await supabase
        .from('routines')
        .insert({
            name: formData.name.trim(),
            days: formData.days,
            is_active: formData.is_active,
            user_id: user.id,
        })
        .select()
        .single()

    if (routineError) throw new Error(routineError.message)

    // Insertar los ejercicios si hay alguno
    if (formData.exercises.length > 0) {
        const { error: exercisesError } = await supabase
            .from('routine_exercises')
            .insert(
                formData.exercises.map(ex => ({
                    ...ex,
                    routine_id: routine.id,
                }))
            )

        if (exercisesError) throw new Error(exercisesError.message)
    }

    revalidatePath('/routines')
    redirect('/routines')
}

// ─── Editar rutina ───
export async function updateRoutine(routineId: string, formData: {
    name: string
    days: string[]
    is_active: boolean
    exercises: {
        exercise_id: string
        sets_target: number
        reps_target: number
        rir_target: number
        rest_seconds: number
        sort_order: number
    }[]
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Actualizar la rutina
    const { error: routineError } = await supabase
        .from('routines')
        .update({
            name: formData.name.trim(),
            days: formData.days,
            is_active: formData.is_active
        })
        .eq('id', routineId)
        .eq('user_id', user.id) // seguridad extra además del RLS

    if (routineError) throw new Error(routineError.message)

    // Reemplazar todos los ejercicios — delete + insert es más simple
    // que intentar hacer diff entre los existentes y los nuevos
    const { error: deleteError } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('routine_id', routineId)

    if (deleteError) throw new Error(deleteError.message)

    if (formData.exercises.length > 0) {
        const { error: insertError } = await supabase
            .from('routine_exercises')
            .insert(
                formData.exercises.map(ex => ({
                    ...ex,
                    routine_id: routineId,
                }))
            )

        if (insertError) throw new Error(insertError.message)
    }

    revalidatePath('/routines')
    redirect('/routines')
}

export async function deleteRoutine(routineId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId)
        .eq('user_id', user.id)
    if(error) throw new Error(error.message)

    revalidatePath('/routines')
    redirect('/routines')
}