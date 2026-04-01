// app/page.tsx
import DashboardHero from '@/components/dashboard/page'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const today = new Date()
  const todayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

  function getWeekStart(date: Date): string {
    const d = new Date(date)
    const day = d.getDay()
    const daysToMonday = day === 0 ? 6 : day - 1
    d.setDate(d.getDate() - daysToMonday)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function deduplicatePRs(sets: { estimated_1rm: number | null, exercise: { name: string } | { name: string }[] }[]) {
    const best: Record<string, { exerciseName: string, estimated1rm: number }> = {}
    for (const set of sets) {
      const exercise = Array.isArray(set.exercise) ? set.exercise[0] : set.exercise
      const name = exercise?.name
      const rm = Number(set.estimated_1rm)
      if (!name || !rm) continue
      if (!best[name] || rm > best[name].estimated1rm) {
        best[name] = { exerciseName: name, estimated1rm: rm }
      }
    }
    return Object.values(best)
  }

  const [{ data: routines }, { data: weeklySessions }, { data: prSets }] = await Promise.all([
    supabase
      .from('routines')
      .select('id, name, days, routine_exercises(id)')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('sessions')
      .select('id, session_sets(weight_kg, reps, rir)')
      .eq('completed', true)
      .gte('date', getWeekStart(today)),
    supabase
      .from('session_sets')
      .select('estimated_1rm, exercise:exercises(name)')
      .order('estimated_1rm', { ascending: false })
      .limit(10),
  ])

  const recentPRs = deduplicatePRs(prSets ?? []).slice(0, 3)
  const allSets = weeklySessions?.flatMap(s => s.session_sets) ?? []

  const weeklyStats = {
    sessions: weeklySessions?.length ?? 0,
    volumeKg: allSets.reduce((sum, set) =>
      sum + (Number(set.weight_kg) * set.reps), 0
    ),
    prs: recentPRs.length,
    avgRir: allSets.length > 0
      ? Number((allSets.reduce((sum, set) => sum + set.rir, 0) / allSets.length).toFixed(1))
      : 0,
  }

  const hasRoutines = (routines ?? []).length > 0

  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-8 min-h-screen px-6 pt-8 pb-32">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-lg font-bold tracking-widest uppercase text-accent">GymLog</h1>
        <p className="text-on-secondary-container text-sm">{formattedDate}</p>
      </div>

      <DashboardHero
        routines={routines ?? []}
        hasRoutines={hasRoutines}
      />

      <div className="flex flex-col gap-3">
        <span className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
          This week
        </span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: weeklyStats.sessions, label: 'Sessions' },
            { value: `${(weeklyStats.volumeKg / 1000).toFixed(1)}k kg`, label: 'Volume' },
            { value: allSets.length, label: 'Total Sets' },
            { value: `RIR ${weeklyStats.avgRir}`, label: 'Avg. intensity' },
          ].map(({ value, label }) => (
            <div key={label} className="border border-on-secondary-container/50 rounded-xl p-5 flex flex-col gap-2">
              <span className="text-content-primary text-2xl font-bold">{value}</span>
              <span className="text-on-secondary-container text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
          Recent PRs
        </span>
        <div className="flex flex-col gap-2">
          {recentPRs.length > 0 ? (
            recentPRs.map((pr, idx) => (
              <div
                key={idx}
                className="border border-on-secondary-container/50 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <span className="text-content-primary text-sm font-medium">{pr.exerciseName}</span>
                <span className="bg-amber text-amber-on text-xs font-bold px-2 py-1 rounded-lg uppercase">
                  {Number(pr.estimated1rm).toFixed(1)} kg
                </span>
              </div>
            ))
          ) : (
            <div className="border border-on-secondary-container/50 rounded-xl px-4 py-3">
              <span className="text-on-secondary-container text-sm">No PRs yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}