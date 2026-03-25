// /app/workouts/[routineId]/page.tsx

import StartWorkoutClient from "@/components/workouts/StartWorkoutClient";
import { RoutineWithExercises } from "@/types/routine";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({
    params,
}: {
    params: Promise<{ routineId: string }>
}) {
    const { routineId } = await params;
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return notFound()
    }

    const { data, error } = await supabase
        .from('routines')
        .select('*, routine_exercises(*, exercise:exercises(id, name, muscle_group))')
        .eq('id', routineId)
        .eq('user_id', user.id)
        .single()

    if (error || !data) {
        return notFound()
    }

    const routine = data as RoutineWithExercises
    return <StartWorkoutClient routine={routine} />;
}
