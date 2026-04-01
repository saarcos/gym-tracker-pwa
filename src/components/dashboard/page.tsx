"use client"
import type { Tables } from "@/types/database"
import { ArrowRightCircle, Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DAY_LABELS } from '@/lib/utils/days'

type DashboardRoutine = Pick<Tables<"routines">, "id" | "name" | "days"> & {
    routine_exercises: Pick<Tables<"routine_exercises">, "id">[]
}

type DashboardHeroProps = {
    routines: DashboardRoutine[]
    hasRoutines: boolean
}

export default function DashboardHero({
    routines,
    hasRoutines,
}: DashboardHeroProps) {
    const router = useRouter();
    const formattedDate = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
    const today = new Date();
    const todayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const [isRoutinePickerOpen, setIsRoutinePickerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const filteredRoutines = routines.filter((routine) => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const matchesCategory = selectedCategory === 'all' || routine.days.includes(todayName)
        const matchesQuery = normalizedQuery.length === 0 || routine.name.toLowerCase().includes(normalizedQuery);
        return matchesCategory && matchesQuery
    })
    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-content-primary text-3xl font-bold leading-tight">
                Ready to train?
            </h2>
            <p className="text-on-secondary-container text-sm">
                {formattedDate}
            </p>
            <button
                onClick={() => setIsRoutinePickerOpen(true)}
                className="w-full bg-accent text-accent-on h-12 rounded-full
                    font-semibold uppercase tracking-wide"
            >
                Start session
            </button>
            {isRoutinePickerOpen && (
                <div className="fixed inset-0 z-100">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/60"
                        onClick={() => {
                            setIsRoutinePickerOpen(false)
                        }}
                        aria-label="Close picker"
                    />
                    <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-black/80 border-t border-on-secondary-container/20 px-5 pb-7 pt-3">
                        <div className="w-12 h-1 rounded-full bg-on-secondary-container/40 mx-auto mb-5" />
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-content-primary font-semibold text-lg">Pick a routine</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRoutinePickerOpen(false)
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-on-secondary-container hover:bg-surface-container-low transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {!hasRoutines ? (
                            <div className="py-8 text-center flex flex-col gap-3">
                                <p className="text-on-secondary-container text-sm">
                                    No routines yet.
                                </p>
                                <button
                                    onClick={() => {
                                        setIsRoutinePickerOpen(false)
                                        router.push('/routines/new')
                                    }}
                                    className="w-full bg-accent text-accent-on h-12 rounded-full font-semibold uppercase"
                                >
                                    Create routine
                                </button>
                            </div>) : (
                            <div>
                                <div className="relative mb-4">
                                    <Search className="w-4 h-4 text-on-secondary-container absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="Search routines..."
                                        className="text-white h-12 w-full pl-11 pr-4 rounded-full bg-surface-container-low border-none text-on-surface placeholder:text-on-secondary-container/60 focus:ring-0"
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                                    {['all', 'today'].map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setSelectedCategory(category)}
                                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${selectedCategory === category
                                                ? "bg-accent text-black"
                                                : "bg-surface-container-low border border-on-secondary-container/30 text-on-secondary-container"
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                                <div className="max-h-[45vh] overflow-y-auto pr-1 space-y-1">
                                    {filteredRoutines.length === 0 ?
                                        (<div className="py-8 text-center text-on-secondary-container text-sm">
                                            No routines available with those filters.
                                        </div>
                                        ) : (
                                            filteredRoutines.map((routine) => (
                                                <button
                                                    key={routine.id}
                                                    type="button"
                                                    onClick={() => { router.push(`/workouts/${routine.id}`) }}
                                                    className="w-full text-left p-3 rounded-xl hover:bg-surface-container-low transition-colors flex items-center justify-between gap-3"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-content-primary font-medium truncate">{routine.name}</p>
                                                        <p className="text-[10px] text-on-secondary-container uppercase tracking-wider font-bold">
                                                            {routine.days.map(d => DAY_LABELS[d]).join(' · ')}
                                                        </p>
                                                    </div>
                                                    <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                                                        <ArrowRightCircle className="w-4 h-4" />
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                </div>
                            </div>
                        )}


                    </div>
                </div>
            )}
        </div>
    )
}
