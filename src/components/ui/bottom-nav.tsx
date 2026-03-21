// src/components/ui/bottom-nav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const routes = [
    {
        href: '/',
        label: 'Home',
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                    d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
                    stroke="currentColor"
                    strokeWidth={active ? 2 : 1.5}
                    strokeLinejoin="round"
                    fill={active ? 'currentColor' : 'none'}
                    fillOpacity={active ? 0.15 : 0}
                />
            </svg>
        ),
    },
    {
        href: '/routines',
        label: 'Routines',
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect
                    x="3" y="3" width="18" height="18" rx="3"
                    stroke="currentColor"
                    strokeWidth={active ? 2 : 1.5}
                    fill={active ? 'currentColor' : 'none'}
                    fillOpacity={active ? 0.15 : 0}
                />
                <line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        href: '/history',
        label: 'History',
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                    cx="12" cy="12" r="9"
                    stroke="currentColor"
                    strokeWidth={active ? 2 : 1.5}
                    fill={active ? 'currentColor' : 'none'}
                    fillOpacity={active ? 0.15 : 0}
                />
                <polyline points="12 7 12 12 15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        href: '/profile',
        label: 'Profile',
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                    cx="12" cy="8" r="4"
                    stroke="currentColor"
                    strokeWidth={active ? 2 : 1.5}
                    fill={active ? 'currentColor' : 'none'}
                    fillOpacity={active ? 0.15 : 0}
                />
                <path
                    d="M4 20C4 17 7.6 15 12 15C16.4 15 20 17 20 20"
                    stroke="currentColor"
                    strokeWidth={active ? 2 : 1.5}
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
]

export default function BottomNav() {
    const pathname = usePathname()

    // No mostrar el nav en login ni signup
    if (pathname === '/login' || pathname === '/signup') return null

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md
                    bg-surface-base border-t border-surface-border
                    px-6 pb-8 pt-3 z-50">
            <div className="flex items-center justify-between">
                {routes.map(({ href, label, icon }) => {
                    const active = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={clsx(
                                'flex flex-col items-center gap-1 min-w-tap transition-colors',
                                active ? 'text-accent' : 'text-content-secondary hover:text-content-primary'
                            )}
                        >
                            {icon(active)}
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}