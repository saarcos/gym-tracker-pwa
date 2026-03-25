// src/app/routines/[routineId]/page.tsx
import { createClient } from '@/utils/supabase/server'
import RoutineForm from '@/components/routines/routine-form'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ routineId: string }> }

export default async function EditRoutinePage({ params }: Props) {
    const { routineId } = await params
    const supabase = await createClient()

    const [{ data: routine }, { data: exercises }] = await Promise.all([
        supabase
            .from('routines')
            .select('*, routine_exercises(*, exercise:exercises(id, name, muscle_group))')
            .eq('id', routineId)
            .single(),
        supabase
            .from('exercises')
            .select('id, name, muscle_group, type')
            .order('name'),
    ])

    if (!routine) notFound()

    return <RoutineForm routine={routine} availableExercises={exercises ?? []} />
}