"use client"
import { ExerciseRow } from "@/app/exercises/page";
import { createExercise, deleteExercise, updateExercise } from "@/lib/actions/exercises";
import { PencilIcon, Plus, Search, Trash } from "lucide-react";
import { useState } from "react";
import CreateExerciseModal from "../routines/create-exercise-modal";

type Props = {
    exercises: ExerciseRow[]
}

const DEFAULT_FORM = {
    name: "",
    muscle_group: "chest",
    type: "compound",
}

export default function ExercisesClient({ exercises }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCreateExerciseModalOpen, setIsCreateExerciseModalOpen] = useState(false)
    const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

    const filteredExercises = exercises.filter((exercise) => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const matchesCategory = selectedCategory === 'all' || exercise.muscle_group === selectedCategory
        const matchesQuery = normalizedQuery.length === 0 || exercise.name.toLowerCase().includes(normalizedQuery)
        return matchesQuery && matchesCategory
    })
    const customExercises = filteredExercises.filter((exercise) => exercise.is_custom)
    const libraryExercises = filteredExercises.filter((exercise) => !exercise.is_custom)
    const categories = [
        "all",
        ...Array.from(new Set(exercises.map((exercise) => exercise.muscle_group))).sort(),
    ]
    const muscleGroups = categories.filter((category) => category !== "all")


    const [newExerciseForm, setNewExerciseForm] = useState({
        ...DEFAULT_FORM,
    })
    const [newExerciseError, setNewExerciseError] = useState("")
    const isEditing = editingExerciseId !== null

    const closeCreateExerciseModal = () => {
        setIsCreateExerciseModalOpen(false)
        setEditingExerciseId(null)
        setNewExerciseForm({ ...DEFAULT_FORM })
        setNewExerciseError("")
    }

    const createCustomExercise = async () => {
        const normalizedName = newExerciseForm.name.trim()

        if (!normalizedName) {
            setNewExerciseError("Exercise name is required.")
            return
        }

        const alreadyExists = exercises.some((exercise) => {
            const sameName = exercise.name.trim().toLowerCase() === normalizedName.toLowerCase()
            if (!sameName) return false
            return isEditing ? exercise.id !== editingExerciseId : true
        })

        if (alreadyExists) {
            setNewExerciseError("An exercise with that name already exists.")
            return
        }

        const formData = {
            ...newExerciseForm,
            name: normalizedName,
        }

        try {
            if (isEditing && editingExerciseId) {
                await updateExercise(editingExerciseId, formData)
            } else {
                await createExercise(formData)
            }
            closeCreateExerciseModal()
        } catch (err) {
            setNewExerciseError(err instanceof Error ? err.message : 'Something went wrong.')
        }
    }

    return (
        <div className="flex flex-col">
            <div className="flex w-full items-center justify-between mb-4">
                <h1 className="text-xl font-bold tracking-widest uppercase text-accent">
                    Exercises
                </h1>
                <button
                    type="button"
                    onClick={() => {
                        setEditingExerciseId(null);
                        setNewExerciseForm({ ...DEFAULT_FORM })
                        setNewExerciseError("")
                        setIsCreateExerciseModalOpen(true);
                    }}
                    className="bg-surface-container-high text-[#c3de83] hover:bg-surface-container-high transition-colors w-10 h-10 rounded-full flex items-center justify-center"
                >
                    <Plus />
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
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="uppercase font-bold text-xs text-on-secondary-container">My Exercises</h2>
                    <span className="bg-accent/20 text-accent text-[10px] px-2 py-0.5 rounded-full font-bold">{customExercises.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                    {customExercises.map((exercise) => (
                        <div key={exercise.id} className="w-full border border-on-secondary-container/30 rounded-xl p-4 bg-surface-container-low flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h2 className="font-medium text-base text-content-primary">{exercise.name}</h2>
                                <p className="text-[0.6875rem] text-on-surface-variant uppercase tracking-wider mt-0.5 text-on-secondary-container">{exercise.name} • {exercise.muscle_group}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingExerciseId(exercise.id)
                                        setNewExerciseForm({
                                            name: exercise.name,
                                            muscle_group: exercise.muscle_group,
                                            type: exercise.type,
                                        })
                                        setNewExerciseError("")
                                        setIsCreateExerciseModalOpen(true)
                                    }}
                                >
                                    <PencilIcon className="w-4 h-4 text-on-secondary-container" />
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!confirm('Delete this exercise? This cannot be undone.')) return
                                        await deleteExercise(exercise.id)
                                    }}
                                >
                                    <Trash className="w-4 h-4 text-on-secondary-container" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <h2 className="uppercase font-bold text-xs text-on-secondary-container">Library</h2>
                    <span className="bg-surface-container-high text-content-primary text-[10px] px-2 py-0.5 rounded-full font-bold">{libraryExercises.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                    {libraryExercises.map((exercise) => (
                        <div key={exercise.id} className="w-full border border-on-secondary-container/30 rounded-xl p-4 bg-surface-container-low flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h2 className="font-medium text-base text-content-primary">{exercise.name}</h2>
                                <p className="text-[0.6875rem] text-on-surface-variant uppercase tracking-wider mt-0.5 text-on-secondary-container">{exercise.name} • {exercise.muscle_group}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <CreateExerciseModal
                isOpen={isCreateExerciseModalOpen}
                isEditing={isEditing}
                form={newExerciseForm}
                muscleGroups={muscleGroups}
                error={newExerciseError}
                onClose={closeCreateExerciseModal}
                onSubmit={createCustomExercise}
                onNameChange={(value) => {
                    setNewExerciseForm((prev) => ({ ...prev, name: value }))
                    if (newExerciseError) setNewExerciseError("")
                }}
                onMuscleGroupChange={(value) =>
                    setNewExerciseForm((prev) => ({ ...prev, muscle_group: value }))
                }
                onTypeChange={(value) =>
                    setNewExerciseForm((prev) => ({ ...prev, type: value }))
                }
            />
        </div>
    )
}
