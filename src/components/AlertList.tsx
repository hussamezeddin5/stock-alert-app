'use client'

import { useState } from 'react'
import type { Alert, AlertType } from '@/types'

interface AlertListProps {
  alerts: Alert[]
  onDelete: (id: string) => void
}

const ALERT_LABELS: Record<AlertType, string> = {
  price_below: 'Price below',
  price_above: 'Price above',
  price_drop_percent: 'Drops by',
  price_rise_percent: 'Rises by',
}

const ALERT_ICONS: Record<AlertType, string> = {
  price_below: '↓',
  price_above: '↑',
  price_drop_percent: '📉',
  price_rise_percent: '📈',
}

function AlertCard({ alert, onDelete }: { alert: Alert; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/alerts/${alert.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete(alert.id)
      }
    } finally {
      setDeleting(false)
    }
  }

  const isPercent = alert.alert_type.includes('percent')
  const valueDisplay = isPercent
    ? `${alert.target_value}%`
    : `$${alert.target_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className={`group relative rounded-xl border p-4 transition-all ${
      alert.triggered
        ? 'border-muted/30 bg-surface/50 opacity-60'
        : 'border-white/10 bg-surface hover:border-accent/30'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
            alert.triggered ? 'bg-surface-2' : 'bg-accent/10 border border-accent/20'
          }`}>
            {ALERT_ICONS[alert.alert_type]}
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-white text-base">{alert.symbol}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${
                alert.asset_type === 'crypto'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}>
                {alert.asset_type}
              </span>
              {alert.triggered && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted/20 text-muted border border-muted/20">
                  Triggered
                </span>
              )}
            </div>
            <p className="text-sm text-muted mt-0.5">
              {ALERT_LABELS[alert.alert_type]}{' '}
              <span className={`font-mono font-semibold ${alert.triggered ? 'text-muted' : 'text-accent'}`}>
                {valueDisplay}
              </span>
            </p>
            <p className="text-xs text-muted/60 mt-1">
              Created {new Date(alert.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-50"
          title="Delete alert"
        >
          {deleting ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default function AlertList({ alerts, onDelete }: AlertListProps) {
  const active = alerts.filter((a) => !a.triggered)
  const triggered = alerts.filter((a) => a.triggered)

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-white/5 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔔</span>
        </div>
        <p className="text-muted text-sm">No alerts yet.</p>
        <p className="text-muted/60 text-xs mt-1">Create your first alert above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Active ({active.length})
          </h3>
          {active.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onDelete={onDelete} />
          ))}
        </div>
      )}

      {triggered.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Triggered ({triggered.length})
          </h3>
          {triggered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
