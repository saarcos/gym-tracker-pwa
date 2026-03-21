// src/components/routines/routine-form.tsx
'use client'

import { RoutineWithExercises, mockAvailableExercises } from "@/lib/mock/routines"
import { ArrowLeft, Plus, Search, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useRef, useState } from "react"

type Props = {
    routine?: RoutineWithExercises  // undefined = modo creacion
}

type TargetField = "sets" | "reps" | "rir" | "rest"

export default function RoutineForm({ routine }: Props) {
    const isEditing = !!routine
    const DAYS = [
        { label: "M", value: "monday" },
        { label: "T", value: "tuesday" },
        { label: "W", value: "wednesday" },
        { label: "Th", value: "thursday" },
        { label: "F", value: "friday" },
        { label: "Sa", value: "saturday" },
        { label: "Su", value: "sunday" },
    ] as const

    const [routineName, setRoutineName] = useState(routine?.name ?? "")
    const [selectedDays, setSelectedDays] = useState<string[]>(routine?.days ?? [])
    const [routineExercises, setRoutineExercises] = useState(routine?.routine_exercises ?? [])
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [exerciseToConfigure, setExerciseToConfigure] = useState<(typeof mockAvailableExercises)[number] | null>(null)
    const [newExerciseTargets, setNewExerciseTargets] = useState({
        sets: "3",
        reps: "10",
        rir: "2",
        rest: "90",
    })
    const draftExerciseCounterRef = useRef(routine?.routine_exercises.length ?? 0)

    const toggleDay = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day]
        )
    }

    const categories = [
        "all",
        ...Array.from(new Set(mockAvailableExercises.map((exercise) => exercise.muscle_group))).sort(),
    ]

    const selectedExerciseIds = new Set(routineExercises.map((exercise) => exercise.exercise_id))
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filteredExercises = mockAvailableExercises.filter((exercise) => {
        const isAlreadyAdded = selectedExerciseIds.has(exercise.id)
        const matchesCategory = selectedCategory === "all" || exercise.muscle_group === selectedCategory
        const matchesQuery = normalizedQuery.length === 0 || exercise.name.toLowerCase().includes(normalizedQuery)

        return !isAlreadyAdded && matchesCategory && matchesQuery
    })

    const formatRest = (seconds: number) => {
        if (seconds >= 60 && seconds % 60 === 0) {
            return `${seconds / 60} min rest`
        }

        return `${seconds}s rest`
    }

    const addExerciseToRoutine = (
        exercise: (typeof mockAvailableExercises)[number],
        targets: { sets: number; reps: number; rir: number; rest: number }
    ) => {
        draftExerciseCounterRef.current += 1
        const uniqueId = `${exercise.id}-${draftExerciseCounterRef.current}`

        setRoutineExercises((prev) => [
            ...prev,
            {
                id: `re-${uniqueId}`,
                routine_id: routine?.id ?? "draft-routine",
                exercise_id: exercise.id,
                sets_target: targets.sets,
                reps_target: targets.reps,
                rir_target: targets.rir,
                rest_seconds: targets.rest,
                sort_order: prev.length,
                created_at: new Date().toISOString(),
                exercise: {
                    id: exercise.id,
                    name: exercise.name,
                    muscle_group: exercise.muscle_group,
                },
            },
        ])
    }

    const normalizeTargetInput = (rawValue: string, min: number, fallback: number, step?: number) => {
        if (rawValue.trim() === "") return String(fallback)

        const parsed = Number(rawValue)
        if (Number.isNaN(parsed)) return String(fallback)

        let normalized = Math.max(min, Math.floor(parsed))

        if (step) {
            normalized = Math.max(min, Math.round(normalized / step) * step)
        }

        return String(normalized)
    }

    const handleTargetChange = (field: TargetField, value: string) => {
        if (/^\d*$/.test(value)) {
            setNewExerciseTargets((prev) => ({ ...prev, [field]: value }))
        }
    }

    const handleTargetBlur = (field: TargetField) => {
        setNewExerciseTargets((prev) => {
            if (field === "sets") return { ...prev, sets: normalizeTargetInput(prev.sets, 1, 1) }
            if (field === "reps") return { ...prev, reps: normalizeTargetInput(prev.reps, 1, 1) }
            if (field === "rir") return { ...prev, rir: normalizeTargetInput(prev.rir, 0, 0) }
            return { ...prev, rest: normalizeTargetInput(prev.rest, 15, 15, 15) }
        })
    }

    const removeExercise = (routineExerciseId: string) => {
        setRoutineExercises((prev) =>
            prev
                .filter((exercise) => exercise.id !== routineExerciseId)
                .map((exercise, index) => ({
                    ...exercise,
                    sort_order: index,
                }))
        )
    }

    const selectExerciseForConfiguration = (exercise: (typeof mockAvailableExercises)[number]) => {
        setExerciseToConfigure(exercise)
        setNewExerciseTargets({
            sets: "3",
            reps: "10",
            rir: "2",
            rest: "90",
        })
    }

    const confirmAddExercise = () => {
        if (!exerciseToConfigure) return

        const normalizedTargets = {
            sets: Number(normalizeTargetInput(newExerciseTargets.sets, 1, 1)),
            reps: Number(normalizeTargetInput(newExerciseTargets.reps, 1, 1)),
            rir: Number(normalizeTargetInput(newExerciseTargets.rir, 0, 0)),
            rest: Number(normalizeTargetInput(newExerciseTargets.rest, 15, 15, 15)),
        }

        addExerciseToRoutine(exerciseToConfigure, normalizedTargets)
        setExerciseToConfigure(null)
    }

    return (
        <>
            <div className="flex flex-col min-h-screen px-6 pt-8 pb-32 gap-8">
                <div className="flex items-center justify-between">
                    <Link href="/routines" className="flex items-center gap-1 text-content-primary">
                        <ArrowLeft />
                        <h1 className="text-lg">{isEditing ? 'Edit routine' : 'New routine'}</h1>
                    </Link>
                    <span className="text-lg font-semibold tracking-widest text-accent">Save</span>
                </div>

                <div className="flex flex-col gap-3">
                    <label htmlFor="routineName" className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
                        Routine Name
                    </label>
                    <input
                        id="routineName"
                        type="text"
                        value={routineName}
                        onChange={(event) => setRoutineName(event.target.value)}
                        placeholder="e.g. Upper A"
                        className="h-12 w-full px-4 rounded-[0.5rem] bg-surface-container-low border-none text-on-surface placeholder:text-on-secondary-container/50 focus:bg-surface-elevated focus:ring-0 transition-colors text-white"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <span className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
                        Training Days
                    </span>
                    <div className="flex gap-2 w-full px-2">
                        {DAYS.map((day) => {
                            const isActive = selectedDays.includes(day.value)

                            return (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={`
                                        w-10 h-10 flex items-center justify-center rounded-full
                                        text-xs font-bold uppercase
                                        transition-all p-5
                                        ${isActive
                                            ? "bg-accent text-black"
                                            : "bg-surface-container-low text-on-secondary-container"
                                        }
                                    `}
                                >
                                    {day.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
                            Exercises
                        </span>
                        <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                            {routineExercises.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {routineExercises.map((routineExercise) => (
                            <div
                                key={routineExercise.id}
                                className="w-full border border-on-secondary-container/30 rounded-xl p-4 bg-surface-container-low"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-content-primary text-base font-semibold truncate">
                                            {routineExercise.exercise.name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                                            <span className="text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                                                {routineExercise.sets_target} sets
                                            </span>
                                            <span className="text-on-secondary-container/40">•</span>
                                            <span className="text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                                                {routineExercise.reps_target} reps
                                            </span>
                                            <span className="text-on-secondary-container/40">•</span>
                                            <span className="text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                                                RIR {routineExercise.rir_target}
                                            </span>
                                            <span className="text-on-secondary-container/40">•</span>
                                            <span className="text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                                                {formatRest(routineExercise.rest_seconds)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeExercise(routineExercise.id)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-on-secondary-container hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                        aria-label={`Remove ${routineExercise.exercise.name}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => {
                                setIsPickerOpen(true)
                                setExerciseToConfigure(null)
                            }}
                            className="w-full h-16 border-2 border-dashed border-on-secondary-container/30 rounded-xl flex items-center justify-center gap-2 text-accent hover:bg-accent/5 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-semibold">Add exercise</span>
                        </button>
                    </div>
                </div>
            </div>

            {isPickerOpen && (
                <div className="fixed inset-0 z-100">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/60"
                        onClick={() => {
                            setIsPickerOpen(false)
                            setExerciseToConfigure(null)
                        }}
                        aria-label="Close picker"
                    />

                    <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-black/80 border-t border-on-secondary-container/20 px-5 pb-7 pt-3">
                        <div className="w-12 h-1 rounded-full bg-on-secondary-container/40 mx-auto mb-5" />

                        <div className="flex items-center justify-between mb-4">
                            <p className="text-content-primary text-base font-semibold">Pick exercise</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsPickerOpen(false)
                                    setExerciseToConfigure(null)
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-on-secondary-container hover:bg-surface-container-low transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <Search className="w-4 h-4 text-on-secondary-container absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search exercises..."
                                className="text-white h-12 w-full pl-11 pr-4 rounded-full bg-surface-container-low border-none text-on-surface placeholder:text-on-secondary-container/60 focus:ring-0"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                            {categories.map((category) => {
                                const isActive = selectedCategory === category

                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => setSelectedCategory(category)}
                                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${isActive
                                            ? "bg-accent text-black"
                                            : "bg-surface-container-low border border-on-secondary-container/30 text-on-secondary-container"
                                            }`}
                                    >
                                        {category}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="max-h-[45vh] overflow-y-auto pr-1 space-y-1">
                            {filteredExercises.length === 0 ? (
                                <div className="py-8 text-center text-on-secondary-container text-sm">
                                    No exercises available with those filters.
                                </div>
                            ) : (
                                filteredExercises.map((exercise) => (
                                    <button
                                        key={exercise.id}
                                        type="button"
                                        onClick={() => selectExerciseForConfiguration(exercise)}
                                        className="w-full text-left p-3 rounded-xl hover:bg-surface-container-low transition-colors flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-content-primary font-medium truncate">{exercise.name}</p>
                                            <p className="text-[10px] text-on-secondary-container uppercase tracking-wider font-bold">
                                                {exercise.muscle_group} · {exercise.type}
                                            </p>
                                        </div>
                                        <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                                            <Plus className="w-4 h-4" />
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>

                        {exerciseToConfigure && (
                            <div className="mt-4 p-4 rounded-xl border border-accent/30 bg-surface-container-low">
                                <p className="text-content-primary font-semibold truncate">{exerciseToConfigure.name}</p>
                                <p className="text-[10px] text-on-secondary-container uppercase tracking-wider font-bold mb-3">
                                    Configure targets
                                </p>

                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    <label className="flex flex-col gap-1">
                                        <span className="text-[10px] text-on-secondary-container font-bold uppercase tracking-wider">Sets</span>
                                        <input
                                            type="number"
                                            min={1}
                                            inputMode="numeric"
                                            value={newExerciseTargets.sets}
                                            onChange={(event) => handleTargetChange("sets", event.target.value)}
                                            onBlur={() => handleTargetBlur("sets")}
                                            className="text-white h-10 px-2 rounded-lg bg-surface-container-high border border-on-secondary-container/25 text-on-surface text-sm focus:ring-0"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-[10px] text-on-secondary-container font-bold uppercase tracking-wider">Reps</span>
                                        <input
                                            type="number"
                                            min={1}
                                            inputMode="numeric"
                                            value={newExerciseTargets.reps}
                                            onChange={(event) => handleTargetChange("reps", event.target.value)}
                                            onBlur={() => handleTargetBlur("reps")}
                                            className="text-white h-10 px-2 rounded-lg bg-surface-container-high border border-on-secondary-container/25 text-on-surface text-sm focus:ring-0"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-[10px] text-on-secondary-container font-bold uppercase tracking-wider">RIR</span>
                                        <input
                                            type="number"
                                            min={0}
                                            inputMode="numeric"
                                            value={newExerciseTargets.rir}
                                            onChange={(event) => handleTargetChange("rir", event.target.value)}
                                            onBlur={() => handleTargetBlur("rir")}
                                            className="text-white h-10 px-2 rounded-lg bg-surface-container-high border border-on-secondary-container/25 text-on-surface text-sm focus:ring-0"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-[10px] text-on-secondary-container font-bold uppercase tracking-wider">Rest</span>
                                        <input
                                            type="number"
                                            min={15}
                                            step={15}
                                            inputMode="numeric"
                                            value={newExerciseTargets.rest}
                                            onChange={(event) => handleTargetChange("rest", event.target.value)}
                                            onBlur={() => handleTargetBlur("rest")}
                                            className="text-white h-10 px-2 rounded-lg bg-surface-container-high border border-on-secondary-container/25 text-on-surface text-sm focus:ring-0"
                                        />
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    onClick={confirmAddExercise}
                                    className="w-full h-11 rounded-full bg-accent text-black font-semibold hover:bg-accent/90 transition-colors"
                                >
                                    Add to routine
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
