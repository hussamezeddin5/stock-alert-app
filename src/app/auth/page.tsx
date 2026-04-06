'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

function AuthForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace('/dashboard')
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        })

        if (error) {
          setError(error.message)
          return
        }

        setMessage('Check your email for a confirmation link, then come back to log in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          setError(error.message)
          return
        }

        router.replace('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
              <span className="text-accent font-mono font-bold">AT</span>
            </div>
            <span className="font-bold text-white text-xl">
              Alert<span className="text-accent">Trader</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-muted text-sm mt-2">
            {mode === 'signup'
              ? 'Start monitoring prices in minutes'
              : 'Sign in to manage your alerts'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-white/10 rounded-2xl p-8">
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-white/10 mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  mode === m
                    ? 'bg-accent text-background'
                    : 'bg-surface-2 text-muted hover:text-white'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-muted"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-muted"
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              {mode === 'signup' && (
                <p className="text-xs text-muted mt-1">Minimum 8 characters</p>
              )}
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {message && (
              <div className="text-sm text-accent bg-accent/10 border border-accent/20 rounded-lg px-4 py-3">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent text-background font-bold text-sm hover:bg-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
                </>
              ) : (
                mode === 'signup' ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-accent hover:underline">
                Log in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-accent hover:underline">
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
