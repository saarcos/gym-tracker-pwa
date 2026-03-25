// /app/workouts/[routineId]/StartWorkoutClient.tsx

"use client";

import { RoutineWithExercises } from "@/types/routine";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Circle, History, Lock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SetValues = {
    kg: string;
    reps: string;
    rir: string;
};

type ExerciseProgress = {
    setsData: SetValues[];
    completedCount: number;
};

type CompletedSet = {
    exerciseId: string;
    setNumber: number;
    weightKg: number;
    reps: number;
    rir: number;
};

export default function StartWorkoutClient({ routine }: { routine: RoutineWithExercises }) {

    const [selectedExercise, setSelectedExercise] = useState(0);

    const currentExercise = routine.routine_exercises[selectedExercise];
    const targetSets = currentExercise?.sets_target ?? 0;

    const buildSetsData = (exerciseIndex: number) => {
        const exercise = routine.routine_exercises[exerciseIndex];
        const defaultSetValues: SetValues = {
            kg: "0",
            reps: String(exercise?.reps_target ?? 12),
            rir: String(exercise?.rir_target ?? 2),
        };
        return Array.from({ length: exercise?.sets_target ?? 0 }, () => ({ ...defaultSetValues }));
    };

    const [setsData, setSetsData] = useState<SetValues[]>(
        buildSetsData(0),
    );
    const [completedCount, setCompletedCount] = useState(0);
    const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
    const [exerciseProgress, setExerciseProgress] = useState<Record<string, ExerciseProgress>>({});
    const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
    const initialTimerMs = (currentExercise?.rest_seconds ?? 120) * 1000;
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [pausedRemainingMs, setPausedRemainingMs] = useState(initialTimerMs);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const isExerciseCompleted = completedCount >= targetSets && editingSetIndex === null;
    const activeSetIndex =
        editingSetIndex !== null
            ? editingSetIndex
            : completedCount < targetSets
                ? completedCount
                : -1;

    const isSetValid = (setValue?: SetValues) => {
        if (!setValue) return false;
        const kg = Number(setValue.kg);
        const reps = Number(setValue.reps);
        const rir = Number(setValue.rir);
        return (
            setValue.kg.trim() !== "" &&
            setValue.reps.trim() !== "" &&
            setValue.rir.trim() !== "" &&
            !Number.isNaN(kg) &&
            !Number.isNaN(reps) &&
            !Number.isNaN(rir) &&
            kg > 0 &&
            reps > 0 &&
            rir >= 0
        );
    };

    const normalizeCompletedSetsForExercise = (
        exerciseId: string,
        exerciseSetsData: SetValues[],
        exerciseCompletedCount: number,
    ) => {
        const currentCompleted = exerciseSetsData
            .slice(0, exerciseCompletedCount)
            .map((set, index) => {
                const weightKg = Number(set.kg);
                const reps = Number(set.reps);
                const rir = Number(set.rir);

                if (
                    set.kg.trim() === "" ||
                    set.reps.trim() === "" ||
                    set.rir.trim() === "" ||
                    Number.isNaN(weightKg) ||
                    Number.isNaN(reps) ||
                    Number.isNaN(rir)
                ) {
                    return null;
                }

                return {
                    exerciseId,
                    setNumber: index + 1,
                    weightKg,
                    reps,
                    rir,
                };
            })
            .filter((set): set is CompletedSet => set !== null);

        setCompletedSets((prev) => {
            const remaining = prev.filter((set) => set.exerciseId !== exerciseId);
            return [...remaining, ...currentCompleted];
        });

        return currentCompleted;
    };

    const persistExerciseProgress = (
        exerciseId: string,
        exerciseSetsData: SetValues[],
        exerciseCompletedCount: number,
    ) => {
        setExerciseProgress((prev) => ({
            ...prev,
            [exerciseId]: {
                setsData: exerciseSetsData,
                completedCount: exerciseCompletedCount,
            },
        }));
        normalizeCompletedSetsForExercise(exerciseId, exerciseSetsData, exerciseCompletedCount);
    };

    const completeActiveSet = () => {
        if (activeSetIndex === -1) return;
        if (!isSetValid(setsData[activeSetIndex])) return;
        if (editingSetIndex !== null) {
            setEditingSetIndex(null);
            if (currentExercise) {
                persistExerciseProgress(currentExercise.exercise_id, setsData, completedCount);
            }
            return;
        }
        const nextCompletedCount = Math.min(completedCount + 1, targetSets);
        setCompletedCount(nextCompletedCount);
        if (currentExercise) {
            persistExerciseProgress(currentExercise.exercise_id, setsData, nextCompletedCount);
        }
        const now = Date.now();
        setPausedRemainingMs(initialTimerMs);
        setEndTime(now + initialTimerMs);
        setNowMs(now);
        setIsTimerRunning(true);
    };

    const enableCompletedSetEdition = (index: number) => {
        if (index >= completedCount) return;
        setEditingSetIndex(index);
    };

    const setRows = useMemo(
        () =>
            Array.from({ length: targetSets }, (_, index) => {
                if (index === activeSetIndex) return "active" as const;
                if (index < completedCount) return "completed" as const;
                return "upcoming" as const;
            }),
        [activeSetIndex, completedCount, targetSets],
    );

    useEffect(() => {
        if (!isTimerRunning) return;
        const intervalId = window.setInterval(() => {
            const now = Date.now();
            setNowMs(now);

            if (endTime !== null && now >= endTime) {
                setIsTimerRunning(false);
                setPausedRemainingMs(0);
                setEndTime(null);
            }
        }, 250);
        return () => window.clearInterval(intervalId);
    }, [endTime, isTimerRunning]);

    const remainingMs = endTime === null
        ? pausedRemainingMs
        : Math.max(endTime - nowMs, 0);
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    const formatTimer = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const toggleTimer = () => {
        if (isTimerRunning && endTime !== null) {
            const now = Date.now();
            const remaining = Math.max(endTime - now, 0);
            setPausedRemainingMs(remaining);
            setEndTime(null);
            setNowMs(now);
            setIsTimerRunning(false);
            return;
        }

        if (pausedRemainingMs <= 0) return;

        const now = Date.now();
        setEndTime(now + pausedRemainingMs);
        setNowMs(now);
        setIsTimerRunning(true);
    };

    const goToExercise = (nextIndex: number) => {
        if (nextIndex < 0 || nextIndex >= routine.routine_exercises.length) return;

        if (currentExercise) {
            persistExerciseProgress(currentExercise.exercise_id, setsData, completedCount);
        }

        const nextExercise = routine.routine_exercises[nextIndex];
        const savedNextProgress = exerciseProgress[nextExercise.exercise_id];
        setSelectedExercise(nextIndex);
        if (savedNextProgress) {
            setSetsData(savedNextProgress.setsData);
            setCompletedCount(savedNextProgress.completedCount);
        } else {
            setSetsData(buildSetsData(nextIndex));
            setCompletedCount(0);
        }
        setEditingSetIndex(null);
        const nextInitialMs = (nextExercise?.rest_seconds ?? 120) * 1000;
        setPausedRemainingMs(nextInitialMs);
        setEndTime(null);
        setIsTimerRunning(false);
        setNowMs(Date.now());
    };

    const finishWorkout = () => {
        let payload = completedSets;

        if (currentExercise) {
            const currentExerciseId = currentExercise.exercise_id;
            persistExerciseProgress(currentExerciseId, setsData, completedCount);
            const currentExerciseCompletedSets = normalizeCompletedSetsForExercise(
                currentExerciseId,
                setsData,
                completedCount,
            );
            payload = [
                ...completedSets.filter((set) => set.exerciseId !== currentExerciseId),
                ...currentExerciseCompletedSets,
            ];
        }

        console.log("Completed sets payload", payload);
    }

    return (
        <div className="flex flex-col gap-6 min-h-screen px-6 pt-8 pb-32">
            <div className="flex items-center justify-between w-full">
                <Link href="/" className="flex items-center gap-1 text-content-primary">
                    <ArrowLeft />
                    <h1 className="text-lg text-content-primary">{routine.name}</h1>
                </Link>
                <span className="text-base text-accent font-semibold">{selectedExercise + 1}/{routine.routine_exercises.length}</span>
            </div>
            <div className="flex flex-col gap-2">
                <h1 className="text-[1.375rem] font-bold leading-tight text-content-primary">{currentExercise?.exercise.name}</h1>
                <p className="text-on-secondary-container text-[0.8125rem] font-medium opacity-70">{currentExercise?.sets_target} sets · {currentExercise?.reps_target} reps · RIR {currentExercise?.rir_target}</p>
                <p className="text-on-secondary-container text-[0.6875rem] font-bold uppercase tracking-wider">Logged sets: {completedSets.length}</p>

                <div className="mt-2 inline-flex items-center gap-2 bg-accent px-3 py-1.5 rounded-full max-w-50">
                    <TrendingUp className="text-accent-on" />
                    <span className="text-accent-on text-[0.75rem] font-bold uppercase tracking-wide">Suggested: 82.5 kg</span>
                </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low rounded-lg opacity-60">
                <div className="flex items-center gap-1">
                    <History className="w-4 h-4 text-on-secondary-container" />
                    <span className="text-on-secondary-container font-bold text-xs">LAST SESSION</span>
                </div>
                <span className="text-xs font-medium text-on-secondary-container">80 kg x 8 reps</span>
            </div>
            {routine.routine_exercises.length > 0 ? (
                <section className="mb-2 overflow-hidden rounded-xl border border-on-secondary-container/25 bg-surface-container-low">
                    <div className="grid grid-cols-5 text-center py-3 border-b border-on-secondary-container/20">
                        <span className="text-[0.6875rem] font-bold uppercase text-on-secondary-container tracking-widest">Set</span>
                        <span className="text-[0.6875rem] font-bold uppercase text-on-secondary-container tracking-widest">kg</span>
                        <span className="text-[0.6875rem] font-bold uppercase text-on-secondary-container tracking-widest">Reps</span>
                        <span className="text-[0.6875rem] font-bold uppercase text-on-secondary-container tracking-widest">RIR</span>
                        <span className="text-[0.6875rem] font-bold uppercase text-on-secondary-container tracking-widest">Status</span>
                    </div>

                    {setRows.map((status, index) => {
                        const setNumber = index + 1;

                        if (status === "completed") {
                            const setValue = setsData[index];
                            return (
                                <div
                                    key={setNumber}
                                    className={`grid grid-cols-5 items-center text-center py-4 border-l-4 border-accent ${index === 0 ? "bg-accent/10" : "bg-surface-container-low"}`}
                                >
                                    <span className="text-[0.875rem] font-bold tabular-nums text-content-primary">{setNumber}</span>
                                    <span className="text-[0.875rem] font-medium tabular-nums text-content-primary">{setValue?.kg}</span>
                                    <span className="text-[0.875rem] font-medium tabular-nums text-content-primary">{setValue?.reps}</span>
                                    <span className="text-[0.875rem] font-medium tabular-nums text-content-primary">{setValue?.rir}</span>
                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => enableCompletedSetEdition(index)}
                                            className="w-8 h-8 rounded-full border-2 border-accent/60 flex items-center justify-center active:scale-90 transition-transform"
                                        >
                                            <CheckCircle2 className="text-accent w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        if (status === "active") {
                            const setValue = setsData[index];
                            return (
                                <div key={setNumber} className="grid grid-cols-5 items-center text-center py-5 bg-surface-container-high border-l-4 border-accent">
                                    <span className="text-[0.875rem] font-black text-accent tabular-nums">{setNumber}</span>
                                    <div className="px-1">
                                        <input
                                            className="text-white h-9 w-full px-2 rounded-lg bg-surface-container-low border border-on-secondary-container/25 text-center text-[0.875rem] font-bold focus:ring-0 tabular-nums"
                                            type="number"
                                            value={setValue?.kg ?? ""}
                                            onChange={(e) =>
                                                setSetsData((prev) =>
                                                    prev.map((item, itemIndex) =>
                                                        itemIndex === index ? { ...item, kg: e.target.value } : item,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="px-1">
                                        <input
                                            className="text-white h-9 w-full px-2 rounded-lg bg-surface-container-low border border-on-secondary-container/25 text-center text-[0.875rem] font-bold focus:ring-0 tabular-nums"
                                            type="number"
                                            value={setValue?.reps ?? ""}
                                            onChange={(e) =>
                                                setSetsData((prev) =>
                                                    prev.map((item, itemIndex) =>
                                                        itemIndex === index ? { ...item, reps: e.target.value } : item,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="px-1">
                                        <input
                                            className="text-white h-9 w-full px-2 rounded-lg bg-surface-container-low border border-on-secondary-container/25 text-center text-[0.875rem] font-bold focus:ring-0 tabular-nums"
                                            type="number"
                                            value={setValue?.rir ?? ""}
                                            onChange={(e) =>
                                                setSetsData((prev) =>
                                                    prev.map((item, itemIndex) =>
                                                        itemIndex === index ? { ...item, rir: e.target.value } : item,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            onClick={completeActiveSet}
                                            disabled={!isSetValid(setValue)}
                                            className="w-8 h-8 rounded-full border-2 border-accent flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40 disabled:active:scale-100"
                                        >
                                            <Circle className="text-accent w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        const setValue = setsData[index];
                        return (
                            <div key={setNumber} className="grid grid-cols-5 items-center text-center py-4 border-l-4 border-transparent text-on-secondary-container bg-surface-container-low/60">
                                <span className="text-[0.875rem] font-bold tabular-nums">{setNumber}</span>
                                <span className="text-[0.875rem] font-medium tabular-nums">{setValue?.kg}</span>
                                <span className="text-[0.875rem] font-medium tabular-nums">{setValue?.reps}</span>
                                <span className="text-[0.875rem] font-medium tabular-nums">{setValue?.rir}</span>
                                <div className="flex justify-center">
                                    <Lock className="text-on-secondary-container w-5 h-5" />
                                </div>
                            </div>
                        );
                    })}
                </section>
            ) : (
                <div>There are not exercises added</div>
            )}
            <section className="flex flex-col gap-4">
                <div className="flex flex-col items-center justify-center border-4 border-accent rounded-full w-40 h-40 mx-auto text-content-primary">
                    <div className="text-center">
                        <span className="block text-[2.5rem] font-bold  leading-none tracking-tight">{formatTimer(remainingSeconds)}</span>
                        <span className="text-[0.625rem] font-black uppercase tracking-widest text-on-secondary-container">
                            {remainingMs === 0 ? "Finished" : isTimerRunning ? "Running" : "Paused"}
                        </span>
                    </div>
                </div>
                <button className="text-accent text-[0.75rem] font-bold uppercase tracking-widest px-6 py-2 rounded-full border border-accent/20 hover:bg-accent/5 active:scale-95 transition-all mx-auto"
                    type="button"
                    onClick={toggleTimer}
                >
                    {isTimerRunning ? "Pause" : "Resume"}
                </button>
            </section>
            <nav className="fixed bottom-0 left-0 w-full bg-surface-base/80 backdrop-blur-xl border-t border-[#45483b]/15 px-6 py-4 pb-8 z-100">
                <div className="flex items-center gap-4 max-w-md mx-auto">
                    <button
                        type="button"
                        onClick={() => goToExercise(selectedExercise - 1)}
                        disabled={selectedExercise === 0}
                        className="flex-1 h-12 rounded-full border border-content-primary/50 flex items-center justify-center gap-2 active:scale-95 transition-transform text-content-primary">
                        <ChevronLeft className="text-[1.25rem]" />
                        <span className="text-[0.8125rem] font-bold uppercase tracking-wider">Previous</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const isLastExercise = selectedExercise >= routine.routine_exercises.length - 1
                            if (isLastExercise) {
                                finishWorkout()
                            } else {
                                goToExercise(selectedExercise + 1)
                            }
                        }}
                        disabled={routine.routine_exercises.length === 0 || !isExerciseCompleted}
                        className="flex-[1.5] h-12 rounded-full bg-accent text-on-primary flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-accent/10">
                        <span className="text-[0.8125rem] font-bold uppercase tracking-wider">
                            {selectedExercise + 1 === routine.routine_exercises.length
                                ? 'Finish'
                                : isExerciseCompleted
                                    ? 'Next exercise'
                                    : `Complete ${targetSets - completedCount} sets`}
                        </span>
                        <ChevronRight className="text-[1.25rem]" />
                    </button>
                </div>
            </nav>
        </div>
    );
}
