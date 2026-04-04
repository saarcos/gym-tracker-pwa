'use client'

type NewExerciseForm = {
    name: string
    muscle_group: string
    type: string
}

type Props = {
    isOpen: boolean
    isEditing?: boolean
    form: NewExerciseForm
    muscleGroups: string[]
    error: string
    onClose: () => void
    onSubmit: () => void
    onNameChange: (value: string) => void
    onMuscleGroupChange: (value: string) => void
    onTypeChange: (value: string) => void
}

export default function CreateExerciseModal({
    isOpen,
    isEditing = false,
    form,
    muscleGroups,
    error,
    onClose,
    onSubmit,
    onNameChange,
    onMuscleGroupChange,
    onTypeChange,
}: Props) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center px-4">
            <button
                type="button"
                className="absolute inset-0 bg-black/70"
                onClick={onClose}
                aria-label="Close new exercise modal"
            />

            <div className="relative z-111 w-full max-w-md rounded-2xl border border-on-secondary-container/25 bg-surface-base p-5">
                <h3 className="text-content-primary text-lg font-semibold">
                    {isEditing ? "Edit exercise" : "Create new exercise"}
                </h3>
                <p className="text-on-secondary-container text-xs uppercase tracking-wider font-bold mt-1 mb-4">
                    {isEditing ? "Update your custom exercise" : "Add it to your picker"}
                </p>

                <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-[10px] text-on-secondary-container font-bold uppercase tracking-wider">Name</span>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(event) => onNameChange(event.target.value)}
                            placeholder="e.g. Incline dumbbell press"
                            className="text-white h-11 px-3 rounded-lg bg-surface-container-low border border-on-secondary-container/25 text-sm focus:ring-0"
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] text-on-secondary-container font-bold uppercase tracking-wider">Muscle group</span>
                            <select
                                value={form.muscle_group}
                                onChange={(event) => onMuscleGroupChange(event.target.value)}
                                className="text-white h-11 px-3 rounded-lg bg-surface-container-low border border-on-secondary-container/25 text-sm focus:ring-0"
                            >
                                {muscleGroups.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] text-on-secondary-container font-bold uppercase tracking-wider">Type</span>
                            <select
                                value={form.type}
                                onChange={(event) => onTypeChange(event.target.value)}
                                className="text-white h-11 px-3 rounded-lg bg-surface-container-low border border-on-secondary-container/25 text-sm focus:ring-0"
                            >
                                <option value="compound">compound</option>
                                <option value="isolation">isolation</option>
                            </select>
                        </label>
                    </div>
                </div>

                {error && (
                    <p className="text-red-400 text-xs mt-3">{error}</p>
                )}

                <div className="flex items-center justify-end gap-2 mt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 px-4 rounded-full border border-on-secondary-container/30 text-on-secondary-container font-semibold hover:bg-surface-container-low transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="h-10 px-5 rounded-full bg-accent text-black font-semibold hover:bg-accent/90 transition-colors"
                    >
                        {isEditing ? "Save changes" : "Add exercise"}
                    </button>
                </div>
            </div>
        </div>
    )
}
