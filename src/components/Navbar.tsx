'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <span className="text-accent font-mono font-bold text-sm">AT</span>
            </div>
            <span className="font-semibold text-white hidden sm:block">
              Alert<span className="text-accent">Trader</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-muted hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-muted hover:text-white transition-colors">
              Pricing
            </Link>
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link
                      href="/dashboard"
                      className="text-sm text-muted hover:text-white transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-sm px-4 py-1.5 rounded-lg border border-white/10 hover:border-white/30 text-muted hover:text-white transition-all"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/auth"
                      className="text-sm text-muted hover:text-white transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth?mode=signup"
                      className="text-sm px-4 py-1.5 rounded-lg bg-accent text-background font-semibold hover:bg-accent-dim transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg border border-white/10 text-muted"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-white/5 pt-4">
            <Link href="/#features" className="block px-2 py-2 text-sm text-muted hover:text-white" onClick={() => setMenuOpen(false)}>
              Features
            </Link>
            <Link href="/pricing" className="block px-2 py-2 text-sm text-muted hover:text-white" onClick={() => setMenuOpen(false)}>
              Pricing
            </Link>
            {!loading && (
              user ? (
                <>
                  <Link href="/dashboard" className="block px-2 py-2 text-sm text-muted hover:text-white" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="block w-full text-left px-2 py-2 text-sm text-muted hover:text-white">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth" className="block px-2 py-2 text-sm text-muted hover:text-white" onClick={() => setMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/auth?mode=signup" className="block px-2 py-2 text-sm text-accent font-semibold" onClick={() => setMenuOpen(false)}>
                    Get Started
                  </Link>
                </>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
