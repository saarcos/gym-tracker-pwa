// src/components/profile/sign-out-button.tsx
'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <button
            onClick={handleSignOut}
            className="w-full h-12 rounded-full border border-rir-hard/50 
                text-rir-hard text-sm font-semibold uppercase tracking-wide
                hover:bg-rir-hard/5 transition-colors"
        >
            Sign out
        </button>
    )
}