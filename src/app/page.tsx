import Link from "next/link"

import { mockRecentPRs, mockTodayRoutine, mockWeeklyStats } from "@/lib/mock/dashboard"
import { mockRoutines } from "@/lib/mock/routines"

export default function Home() {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  const hasRoutines = mockRoutines.length > 0
  const todayRoutine = hasRoutines ? mockTodayRoutine : null
  const weeklyStats = mockWeeklyStats
  const recentPrs = mockRecentPRs

  return (
    <div className="flex flex-col gap-8 min-h-screen px-6 pt-8 pb-32">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-lg font-bold tracking-widest uppercase text-accent">GymLog</h1>
        <p className="text-on-secondary-container text-sm">{formattedDate}</p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
          Today
        </span>

        {todayRoutine ? (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-content-primary text-3xl font-bold leading-tight">
                {todayRoutine.name}
              </h2>
              <p className="text-on-secondary-container text-sm">6 exercises</p>
            </div>
            <div className="w-full h-0.5 bg-on-secondary-container rounded-full overflow-hidden">
              <div className="h-full bg-accent w-0" />
            </div>
            <Link
              href={`/workouts/${todayRoutine.id}`}
              className="flex items-center justify-center w-full bg-accent hover:bg-accent-hover text-accent-on
            h-12 rounded-full mt-1 font-semibold uppercase tracking-wide
            transition-colors"
            >
              Start session
            </Link>
          </>
        ) : (
          <div className="border border-on-secondary-container/50 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-on-secondary-container text-sm">No routines created yet.</p>
            <Link
              href="/routines/new"
              className="w-full bg-accent hover:bg-accent-hover text-accent-on
                        h-12 rounded-full font-semibold uppercase tracking-wide
                        transition-colors inline-flex items-center justify-center"
            >
              Create routine
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
          This week
        </span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: weeklyStats.sessions, label: "Sessions" },
            { value: `${weeklyStats.volumeKg / 1000}k kg`, label: "Volume" },
            { value: weeklyStats.prs, label: "PRs" },
            { value: `RIR ${weeklyStats.avgRir}`, label: "Avg. intensity" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="border border-on-secondary-container/50 rounded-xl p-5 flex flex-col gap-2"
            >
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
          {recentPrs.length > 0 ? (
            recentPrs.map((pr, idx) => (
              <div
                key={idx}
                className="border border-on-secondary-container/50 rounded-xl px-4 py-3
                          flex items-center justify-between"
              >
                <span className="text-content-primary text-sm font-medium">{pr.exercise}</span>
                <span
                  className="bg-amber text-amber-on text-xs font-bold
                             px-2 py-1 rounded-lg uppercase tracking-tight"
                >
                  PR {pr.weightKg} kg
                </span>
              </div>
            ))
          ) : (
            <div className="border border-on-secondary-container/50 rounded-xl px-4 py-3">
              <span className="text-on-secondary-container text-sm">No recent PRs yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
