// new/page.tsx
import RoutineForm from '@/components/routines/routine-form'
import { createClient } from '@/utils/supabase/server'

export default async function NewRoutinePage() {
    const supabase = await createClient();
    const { data: exercises } = await supabase
        .from('exercises')
        .select('id, name, muscle_group, type')
        .order('name')
    return <RoutineForm availableExercises = {exercises ?? []} />
}