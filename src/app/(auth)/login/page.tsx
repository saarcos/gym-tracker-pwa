'use client'
import { useEffect, useState, type SyntheticEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.replace('/')
        })
    }, [])

    async function handleLogin(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError('Invalid email or password')
            setLoading(false)
            return
        }

        router.push('/')
        router.refresh()
    }

    return (
        <div className="bg-surface-base">
            <header className="fixed top-0 left-0 w-full flex items-center justify-center px-6 h-16 bg-surface-base">
                <h1 className="font-bold text-[18px] tracking-widest text-[#c3de83] uppercase">GymLog</h1>
            </header>
            <div className='min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-24'>
                <div className="w-full max-w-100 mb-10 text-center md:text-left">
                    <h2 className="text-[24px] font-bold text-content-primary leading-tight mb-2">Welcome back</h2>
                    <p className="text-[14px] text-on-secondary-container font-medium">Continue your progress.</p>
                </div>
                <form onSubmit={handleLogin} className="flex w-full max-w-100 flex-col gap-6">
                    <div className='flex flex-col gap-2'>
                        <label htmlFor='email' className='text-[11px] font-bold uppercase tracking-wider text-content-primary px-1'>Email</label>
                        <input
                            id='email'
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="h-12 w-full px-4 rounded-[0.5rem] bg-surface-container-low border-none text-on-surface placeholder:text-on-secondary-container/50 focus:bg-surface-elevated focus:ring-0 transition-colors text-white"
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor='password' className='text-[11px] font-bold uppercase tracking-wider text-content-primary px-1'>Password</label>
                        <input
                            id='password'
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="h-12 w-full px-4 rounded-[0.5rem] bg-surface-container-low border-none text-on-surface placeholder:text-on-secondary-container/50 focus:bg-surface-elevated focus:ring-0 transition-colors text-white"
                        />
                    </div>

                    {error && (
                        <p className="text-rir-hard text-center text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-accent text-accent-on hover:bg-accent-hover h-tap rounded-pill font-semibold transition-colors disabled:opacity-50 uppercase"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                <div className="mt-12 text-[14px]">
                    <span className="text-on-secondary-container">New to GymLog?</span>
                    <Link
                        href="/sign-up"
                        className="ml-1 font-bold text-content-primary underline-offset-4 hover:underline"
                    >
                        Go to signup
                    </Link>
                </div>
            </div>
        </div>
    )
}
