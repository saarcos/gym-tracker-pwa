// /app/workouts/[routineId]/page.tsx

import StartWorkoutClient from "@/components/workouts/StartWorkoutClient";
import { getRoutineById } from "@/lib/services/routines";
import { notFound } from "next/navigation";

export default async function Page({
    params,
}: {
    params: Promise<{ routineId: string }>
}) {
    const { routineId } = await params;

    const routine = await getRoutineById(routineId);

    if(!routine){
        return notFound();
    }
    return <StartWorkoutClient routine={routine} />;
}