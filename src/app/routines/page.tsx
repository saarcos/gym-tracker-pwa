import { formatDays } from "@/lib/utils/days";
import { createClient } from "@/utils/supabase/server";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";


type RoutineRow = {
    id: string
    name: string
    days: string[]
    is_active: boolean
    routine_exercises: { id: string }[]
}
// src/app/routines/page.tsx
export default async function RoutinesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser()

    let routines: RoutineRow[] = []

    if (user) {
        const { data, error } = await supabase
            .from('routines')
            .select('id, name, days, is_active, routine_exercises(id)')
            .eq('user_id', user.id)
            .order('name')

        if (!error && data) {
            routines = data as RoutineRow[]
        }
    }

    const activeRoutines = routines.filter((routine) => routine.is_active);
    const inactiveRoutines = routines.filter((routine) => !routine.is_active);

    if (routines.length === 0) {
        return (
            <div className="flex flex-col min-h-screen px-6 pt-8 pb-32">
                <div className="flex w-full items-center justify-between">
                    <h1 className="text-xl font-bold tracking-widest uppercase text-accent">
                        Routines
                    </h1>
                    <Link
                        href="/routines/new"
                        className="bg-surface-container-high text-[#c3de83] hover:bg-surface-container-high transition-colors w-10 h-10 rounded-full flex items-center justify-center"
                    >
                        <Plus />
                    </Link>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                    <div className="mb-12 relative flex items-center justify-center">
                        <div className="absolute -inset-10 opacity-20 pointer-events-none">
                            <div className="grid grid-cols-4 gap-4 h-full w-full">
                                <div className="border-l border-t border-on-secondary-container/30" />
                                <div />
                                <div className="border-l border-on-secondary-container/30" />
                                <div className="border-l border-t border-on-secondary-container/30" />
                            </div>
                        </div>

                        <div className="w-32 h-44 border border-on-secondary-container/30 rounded-xl flex flex-col p-4 gap-3 relative overflow-hidden bg-surface-base">
                            <div className="w-full h-2 bg-surface-container-high rounded-full" />
                            <div className="w-2/3 h-2 bg-surface-container-high rounded-full" />
                            <div className="mt-auto flex justify-between">
                                <div className="w-6 h-6 border border-on-secondary-container/20 rounded-sm" />
                                <div className="w-6 h-6 border border-on-secondary-container/20 rounded-sm" />
                                <div className="w-6 h-6 border border-on-secondary-container/20 rounded-sm" />
                            </div>
                            <div className="absolute inset-0 bg-accent/5 blur-3xl pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-3 max-w-xs">
                        <h2 className="text-3xl font-semibold leading-tight text-content-primary tracking-tight">
                            No routines yet
                        </h2>
                        <p className="text-sm text-on-secondary-container font-medium tracking-wide">
                            Create your first routine to get started
                        </p>
                    </div>

                    <div className="mt-12">
                        <Link
                            href="/routines/new"
                            className="bg-surface-container-high text-[#c3de83] w-10 h-10 rounded-full flex items-center justify-center"
                        >
                            <Plus />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen gap-8 px-6 pt-8 pb-32">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-lg font-bold tracking-widest uppercase text-accent">
                    Routines
                </h1>
                <Link
                    href="/routines/new"
                    className="bg-surface-container-high text-[#c3de83] hover:bg-surface-container-high transition-colors w-10 h-10 rounded-full flex items-center justify-center"
                >
                    <Plus />
                </Link>
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
                    ACTIVE
                </span>
                {activeRoutines.map((routine) => (
                    <Link href={`/routines/${routine.id}`} key={routine.id} className="w-full flex justify-between items-center p-4 border border-on-secondary-container/50 rounded-xl">
                        <div className="flex flex-col gap-1">
                            <p className="text-content-primary text-lg font-semibold">{routine.name}</p>
                            <div className="flex items-center gap-2">
                                {routine.days.map((day, idx) => (
                                    <div key={idx} className="px-2 py-0.5 bg-accent text-black text-[10px] font-bold rounded-sm uppercase tracking-wider">
                                        {formatDays(day)}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 uppercase font-semibold text-xs text-on-secondary-container">
                            <p>{routine.routine_exercises.length} {routine.routine_exercises.length !== 1 ? "exercises" : "exercise"} </p>
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </Link>
                ))}
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
                    INACTIVE
                </span>
                {inactiveRoutines.map((routine) => (
                    <Link href={`/routines/${routine.id}`} key={routine.id} className="w-full flex justify-between items-center p-4 border border-on-secondary-container/50 rounded-xl opacity-40">
                        <div className="flex flex-col gap-1">
                            <p className="text-content-primary text-lg font-semibold">{routine.name}</p>
                            <div className="flex items-center gap-2">
                                {routine.days.map((day, idx) => (
                                    <div key={idx} className="px-2 py-0.5 bg-accent text-black text-[10px] font-bold rounded-sm uppercase tracking-wider">
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 uppercase font-semibold text-xs text-on-secondary-container">
                            <p>{routine.routine_exercises.length} {routine.routine_exercises.length !== 1 ? "exercises" : "exercise"} </p>
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
