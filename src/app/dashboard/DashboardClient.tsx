'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Alert, UserProfile } from '@/types'
import AlertForm from '@/components/AlertForm'
import AlertList from '@/components/AlertList'

interface DashboardClientProps {
  user: User
  profile: UserProfile | null
  initialAlerts: Alert[]
}

export default function DashboardClient({
  user,
  profile,
  initialAlerts,
}: DashboardClientProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const isSubscribed = profile?.subscribed === true

  const handleAlertCreated = async () => {
    setShowForm(false)
    // Refresh alerts from server
    const res = await fetch('/api/alerts')
    if (res.ok) {
      const data = await res.json()
      setAlerts(data)
    }
    setRefreshKey((k) => k + 1)
  }

  const handleAlertDeleted = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  const activeCount = alerts.filter((a) => !a.triggered).length
  const triggeredCount = alerts.filter((a) => a.triggered).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/5 bg-surface/30">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-muted mt-0.5">{user.email}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Subscription badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                isSubscribed
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-muted/30 bg-surface-2 text-muted'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSubscribed ? 'bg-accent' : 'bg-muted'}`} />
                {isSubscribed ? 'Pro Plan' : 'Free'}
              </div>

              {isSubscribed && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-background font-semibold text-sm hover:bg-accent-dim transition-colors"
                >
                  {showForm ? '✕ Cancel' : '+ New Alert'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Not subscribed banner */}
        {!isSubscribed && (
          <div className="mb-8 rounded-2xl border border-accent/20 bg-accent/5 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-white">Subscribe to create alerts</h2>
                <p className="text-sm text-muted mt-1">
                  Get full access to price alerts for stocks and crypto for just $15/month.
                </p>
              </div>
              <Link
                href="/pricing"
                className="flex-shrink-0 px-6 py-2.5 rounded-xl bg-accent text-background font-bold text-sm hover:bg-accent-dim transition-colors whitespace-nowrap"
              >
                Subscribe — $15/mo
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          {isSubscribed && (
            <div className="lg:col-span-1">
              {/* Mobile: toggle form */}
              <div className="lg:hidden">
                {showForm && (
                  <div className="mb-6 rounded-2xl border border-white/10 bg-surface p-6">
                    <h2 className="font-semibold text-white mb-5">New Alert</h2>
                    <AlertForm onSuccess={handleAlertCreated} />
                  </div>
                )}
              </div>

              {/* Desktop: always visible */}
              <div className="hidden lg:block rounded-2xl border border-white/10 bg-surface p-6 sticky top-24">
                <h2 className="font-semibold text-white mb-5">Create Alert</h2>
                <AlertForm key={refreshKey} onSuccess={handleAlertCreated} />
              </div>
            </div>
          )}

          {/* Right: Alerts list */}
          <div className={isSubscribed ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total', value: alerts.length, color: 'text-white' },
                { label: 'Active', value: activeCount, color: 'text-accent' },
                { label: 'Triggered', value: triggeredCount, color: 'text-muted' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/5 bg-surface p-4 text-center">
                  <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface p-6">
              <h2 className="font-semibold text-white mb-5">Your Alerts</h2>
              <AlertList alerts={alerts} onDelete={handleAlertDeleted} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
