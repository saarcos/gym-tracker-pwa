// src/lib/utils/days.ts
export const DAY_LABELS: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
}

export const ALL_DAYS = Object.keys(DAY_LABELS)

export function formatDays(day: string): string {
    return DAY_LABELS[day]
}