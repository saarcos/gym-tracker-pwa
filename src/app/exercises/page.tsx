import ExercisesClient from "@/components/exercises/ExercisesClient";
import { createClient } from "@/utils/supabase/server"


export type ExerciseRow = {
    id: string,
    user_id: string,
    name: string,
    muscle_group: string,
    type: string,
    is_custom: boolean,
}
export default async function Exercises() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    let exercises: ExerciseRow[] = []
    if (user) {
        const { data, error } = await supabase
            .from('exercises')
            .select('id, user_id, name, muscle_group, type, is_custom')
            .order('name')

        if (!error && data) {
            exercises = data as ExerciseRow[]
        }
    }
    return (
        <div className="flex flex-col min-h-screen px-6 pt-8 pb-32 gap-6">
            
            <ExercisesClient exercises={exercises}/>
        </div>
    )
}
