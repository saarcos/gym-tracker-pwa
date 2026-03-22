import { mockRoutines } from "../mock/routines";

export async function getRoutineById(id: string) {
    const routine = mockRoutines.find((routine)=>routine.id===id);
    return routine
}