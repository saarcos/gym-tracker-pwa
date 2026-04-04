import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import SignOutButton from "@/components/profile/sign-out-button"

export default async function Profile() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: sessions } = await supabase
        .from('sessions')
        .select('id, session_sets(weight_kg, reps, exercise:exercises(muscle_group))')
        .eq('completed', true)

    const { data: routines } = await supabase
        .from('routines')
        .select('id')

    const { data: exercises } = await supabase
        .from('exercises')
        .select('id')
        .eq('is_custom', true)

    const allSets = sessions?.flatMap(s => s.session_sets) ?? []

    // Músculo favorito — el que más aparece en los sets
    const muscleCount: Record<string, number> = {}
    for (const set of allSets) {
        const exercise = Array.isArray(set.exercise)
            ? set.exercise[0]
            : set.exercise as { muscle_group: string } | null

        const muscle = exercise?.muscle_group
        if (muscle) muscleCount[muscle] = (muscleCount[muscle] ?? 0) + 1
    }
    const favoriteMuscle = Object.entries(muscleCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

    const totalVolumeKg = allSets.reduce(
        (sum, set) => sum + (Number(set.weight_kg) * set.reps), 0
    )
    const formattedVolume = totalVolumeKg >= 1000
        ? `${(totalVolumeKg / 1000).toFixed(1)}k kg`
        : `${totalVolumeKg} kg`

    const email = user?.email ?? '—'
    const initials = email.slice(0, 2).toUpperCase()

    return (
        <div className="flex flex-col min-h-screen px-6 pt-8 pb-32 gap-10">
            <h1 className="text-xl text-accent font-bold uppercase tracking-widest">Profile</h1>

            <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-accent-on font-bold text-xl">{initials}</span>
                </div>
                <p className="text-[13px] text-on-secondary-container">{email}</p>
            </div>

            <div className="flex flex-col gap-3">
                <span className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
                    All time
                </span>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: sessions?.length ?? 0, label: 'Sessions' },
                        { value: formattedVolume, label: 'Volume' },
                        { value: `${allSets.length}`, label: 'Sets logged' },
                        { value: favoriteMuscle, label: 'Top muscle' },
                    ].map(({ value, label }) => (
                        <div key={label} className="border border-on-secondary-container/50 rounded-xl p-5 flex flex-col gap-2">
                            <span className="text-content-primary text-2xl font-bold capitalize">{value}</span>
                            <span className="text-on-secondary-container text-xs">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Account */}
            <div className="flex flex-col gap-3">
                <span className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
                    Account
                </span>
                <div className="border border-on-secondary-container/50 rounded-xl overflow-hidden">
                    <Link
                        href="/routines"
                        className="flex items-center justify-between px-4 py-4 hover:bg-surface-elevated transition-colors"
                    >
                        <span className="text-content-primary text-sm font-medium">Routines</span>
                        <div className="flex items-center gap-2 text-on-secondary-container">
                            <span className="text-sm">{routines?.length ?? 0}</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>
                    <div className="h-px bg-on-secondary-container/10" />
                    <Link
                        href="/exercises"
                        className="flex items-center justify-between px-4 py-4 hover:bg-surface-elevated transition-colors"
                    >
                        <span className="text-content-primary text-sm font-medium">Custom exercises</span>
                        <div className="flex items-center gap-2 text-on-secondary-container">
                            <span className="text-sm">{exercises?.length ?? 0}</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Sign out */}
            <SignOutButton />
        </div>
    )
}