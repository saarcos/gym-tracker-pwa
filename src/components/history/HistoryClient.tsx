"use client"
import WorkoutCalendar from "@/components/history/WorkoutCalendar";
import { SessionWithStats } from "@/app/history/page";
import { deleteSession } from "@/lib/actions/sessions";
import { Calendar, Calendar1, EllipsisVertical, EyeIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
export default function HistoryClient({ sessions }: { sessions: SessionWithStats[] }) {
    const router = useRouter();
    function getWeekStart(dateStr: string): string {
        // Parsear manualmente para evitar conversión UTC
        const [year, month, day] = dateStr.split('-').map(Number)
        const date = new Date(year, month - 1, day) // mes es 0-indexed

        const dayOfWeek = date.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        date.setDate(date.getDate() - daysToMonday)

        // Formatear manualmente también para evitar el mismo problema al revés
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }
    function groupByWeekStart(sessions: SessionWithStats[]) {
        return sessions.reduce((groups, session) => {
            const weekStart = getWeekStart(session.date)

            if (!groups[weekStart]) {
                groups[weekStart] = []
            }

            groups[weekStart].push(session)
            return groups
        }, {} as Record<string, SessionWithStats[]>)
    }
    function addDays(dateStr: string, daysToAdd: number): string {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        date.setDate(date.getDate() + daysToAdd);

        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');

        return `${y}-${m}-${d}`;
    }
    function getMonthName(dateStr: string) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    }
    function formatDate(dateStr: string) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day); // local time

        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }
    const [sessionList, setSessionList] = useState<SessionWithStats[]>(sessions)
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const sessionsByWeek = groupByWeekStart(sessionList);
    const weeks = Object.keys(sessionsByWeek)
    const sessionDates = Array.from(new Set(sessionList.map((session) => session.date)));
    const activeWeek = selectedWeek && sessionsByWeek[selectedWeek]
        ? selectedWeek
        : (weeks[0] ?? null)

    async function handleDelete(sessionId: string) {
        const confirmed = window.confirm("Delete this session?")
        if (!confirmed) return

        const previousSessions = sessionList
        setSessionList((prev) => prev.filter((s) => s.id !== sessionId))
        setMenuOpenFor(null)

        if (sessionId.startsWith("mock-")) {
            return
        }

        startTransition(async () => {
            const result = await deleteSession(sessionId)
            if (!result.ok) {
                setSessionList(previousSessions)
                window.alert(result.error ?? "Couldn't delete the session")
            }
        })
    }
    function handleViewSession(sessionId: string) {
        router.push(`/sessions/${sessionId}`)
    }

    if (sessionList.length === 0) {
        return (
            <div className="flex flex-col gap-6 min-h-screen px-6 pt-8 pb-32">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-content-primary">
                        <h1 className="text-xl text-accent">History</h1>
                    </div>
                    <button className="text-content-primary">
                        <Calendar />
                    </button>
                </div>
                <section className="flex flex-col items-center justify-center px-8 pb-24 mt-50 text-on-secondary-container">
                    <div className="relative group">
                        <div className="relative flex flex-col items-center text-center max-w-xs">
                            <div className="mb-10 p-8 rounded-full bg-surface-container-low flex items-center justify-center">
                                <Calendar1 className="text-accent w-14 h-14 opacity-40 font-light" />
                            </div>
                            <h2 className="font-headline text-[2rem] font-bold text-on-surface tight-leading mb-3">No sessions yet</h2>
                            <p className="font-body text-on-surface-variant text-base tracking-wide leading-relaxed">
                                Complete your first workout to see it here
                            </p>
                        </div>

                    </div>
                </section>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 min-h-screen px-6 pt-8 pb-32">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-content-primary">
                    <h1 className="text-xl text-accent">History</h1>
                </div>
                <button
                    type="button"
                    className="text-content-primary"
                    onClick={() => setIsCalendarOpen((prev) => !prev)}
                    aria-label="Toggle calendar"
                    aria-expanded={isCalendarOpen}
                >
                    <Calendar />
                </button>
            </div>
            {isCalendarOpen && (
                <section className="bg-surface-base rounded-2xl p-4 border border-outline-variant/20">
                    <WorkoutCalendar
                        sessionDates={sessionDates}
                        selectedDate={selectedDate}
                        onDaySelect={(date) => {
                            setSelectedDate(date);
                            setSelectedWeek(date ? getWeekStart(date) : null);
                        }}
                    />
                </section>
            )}
            <div className="overflow-x-auto gap-3 hide-scrollbar pb-2 flex">
                {Object.entries(sessionsByWeek).slice(0, 3).map(([date, sessionsArray]) => {
                    const weekEnd = addDays(date, 6);

                    const dayStart = date.split('-')[2];
                    const dayEnd = weekEnd.split('-')[2];
                    const monthName = getMonthName(date); // usa el inicio de semana
                    return (
                        <div key={date} className={`${activeWeek === date ? 'bg-accent text-accent-on' : 'bg-surface-container-low text-white'} px-4 py-3 rounded-full border border-outline-variant/15 `} onClick={() => { setSelectedWeek(date) }}>
                            <h3 className="font-bold text-[0.6875rem] uppercase">
                                {monthName.substring(0, 3)} {dayStart} - {dayEnd}
                            </h3>
                            <p className="text-on-surface-variant/40 text-sm font-medium">
                                {sessionsArray.length}{' '}
                                {sessionsArray.length !== 1 ? 'sessions' : 'session'}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div className="flex flex-col gap-6 text-sm">
                <div className="flex items-center justify-between w-full">
                    <h1 className="uppercase font-bold  text-on-secondary-container">This week</h1>
                    <p className="text-on-secondary-container">{activeWeek ? sessionsByWeek[activeWeek].length : 0} Total</p>
                </div>
                <div className="flex flex-col gap-3">
                    {(activeWeek ? sessionsByWeek[activeWeek] : []).map((session) => (
                        <div className="bg-accent-on p-4 rounded-xl relative" key={session.id}>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-accent text-base font-semibold">{session.routineName}</h3>
                                </div>
                                <button
                                    type="button"
                                    className="text-on-secondary-container w-8 h-8 flex items-center justify-center"
                                    onClick={() => setMenuOpenFor((prev) => prev === session.id ? null : session.id)}
                                    aria-label="Open session actions"
                                >
                                    <EllipsisVertical className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-on-secondary-container">{formatDate(session.date)}</p>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                <div className="bg-surface-container-low/50 p-3 rounded-3xl border border-[#1a1a1a] text-white">
                                    <p
                                        className="text-[0.6rem] font-extrabold uppercase text-on-surface-variant tracking-tighter mb-1">
                                        Time</p>
                                    <p className="text-on-surface font-bold text-sm">{session.durationMinutes} min</p>
                                </div>
                                <div className="bg-surface-container-low/50 p-3 rounded-3xl border border-[#1a1a1a] text-white">
                                    <p
                                        className="text-[0.6rem] font-extrabold uppercase text-on-surface-variant tracking-tighter mb-1">
                                        Volume</p>
                                    <p className="text-on-surface font-bold text-sm">{session.totalVolumeKg}k kg</p>
                                </div>
                                <div className="bg-surface-container-low/50 p-3 rounded-3xl border border-[#1a1a1a] text-white">
                                    <p
                                        className="text-[0.6rem] font-extrabold uppercase text-on-surface-variant tracking-tighter mb-1">
                                        Sets</p>
                                    <p className="text-on-surface font-bold text-sm">{session.totalSets} sets</p>
                                </div>
                            </div>
                            {menuOpenFor === session.id && (
                                <div className="absolute top-14 right-4 z-10 rounded-xl border border-outline-variant/30 bg-surface-base p-2 shadow-lg">
                                    <button
                                        type="button"
                                        className="text-on-secondary-container flex items-center gap-1 text-xs font-semibold px-3 py-2 disabled:opacity-50"
                                        onClick={() => handleViewSession(session.id)}
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        View Session
                                    </button>
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 text-red-400 text-xs font-semibold px-3 py-2 disabled:opacity-50 border-t"
                                        onClick={() => handleDelete(session.id)}
                                        disabled={isPending}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {isPending ? "Deleting..." : "Delete Session"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
