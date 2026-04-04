"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from 'next/cache'

// ─── Crear ejercicio custom ───
export async function createExercise(formData: {
    name: string
    muscle_group: string
    type: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('exercises')
        .insert({
            name: formData.name.trim(),
            muscle_group: formData.muscle_group,
            type: formData.type,
            is_custom: true,
            user_id: user.id,
        })
        .select()
        .single()

    if (error) {
        // Violación de unique constraint (nombre duplicado)
        if (error.code === '23505') {
            throw new Error('An exercise with that name already exists.')
        }
        throw new Error(error.message)
    }
    revalidatePath('/exercises')

    return data
}
export async function deleteExercise(exerciseId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('user_id', user.id)
    if (error) throw new Error(error.message)
    revalidatePath('/exercises')
}
export async function updateExercise(exerciseId: string, formData: {
    name: string,
    muscle_group: string,
    type: string,
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error: exerciseError } = await supabase
        .from('exercises')
        .update({
            name: formData.name,
            muscle_group: formData.muscle_group,
            type: formData.type
        })
        .eq('id', exerciseId)
        .eq('user_id', user.id)
    if (exerciseError) throw new Error(exerciseError.message)
    revalidatePath('/exercises')
}