'use client'

import { useState } from 'react'
import type { AlertType, AssetType } from '@/types'

interface AlertFormProps {
  onSuccess: () => void
}

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOGE', 'XRP', 'AVAX', 'MATIC', 'DOT']
const STOCK_SYMBOLS = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'SPY', 'QQQ', 'NFLX']

const ALERT_TYPES: { value: AlertType; label: string; placeholder: string }[] = [
  { value: 'price_below', label: 'Price goes below $', placeholder: 'e.g. 50000' },
  { value: 'price_above', label: 'Price goes above $', placeholder: 'e.g. 80000' },
  { value: 'price_drop_percent', label: 'Price drops by %', placeholder: 'e.g. 10' },
  { value: 'price_rise_percent', label: 'Price rises by %', placeholder: 'e.g. 15' },
]

export default function AlertForm({ onSuccess }: AlertFormProps) {
  const [assetType, setAssetType] = useState<AssetType>('crypto')
  const [symbol, setSymbol] = useState('')
  const [customSymbol, setCustomSymbol] = useState('')
  const [alertType, setAlertType] = useState<AlertType>('price_below')
  const [targetValue, setTargetValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const symbolOptions = assetType === 'crypto' ? CRYPTO_SYMBOLS : STOCK_SYMBOLS
  const selectedAlertType = ALERT_TYPES.find((a) => a.value === alertType)!
  const finalSymbol = symbol === '__custom__' ? customSymbol.toUpperCase() : symbol

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!finalSymbol) {
      setError('Please select or enter a symbol.')
      return
    }
    if (!targetValue || isNaN(Number(targetValue)) || Number(targetValue) <= 0) {
      setError('Please enter a valid target value.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: finalSymbol,
          asset_type: assetType,
          alert_type: alertType,
          target_value: Number(targetValue),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to create alert.')
        return
      }

      // Reset form
      setSymbol('')
      setCustomSymbol('')
      setTargetValue('')
      onSuccess()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Asset type toggle */}
      <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Asset Type
        </label>
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          {(['crypto', 'stock'] as AssetType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setAssetType(type); setSymbol('') }}
              className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${
                assetType === type
                  ? 'bg-accent text-background'
                  : 'bg-surface-2 text-muted hover:text-white'
              }`}
            >
              {type === 'crypto' ? '₿ Crypto' : '📈 Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Symbol picker */}
      <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Symbol
        </label>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-accent focus:ring-0 appearance-none"
          required
        >
          <option value="">Select a symbol…</option>
          {symbolOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
          <option value="__custom__">Custom symbol…</option>
        </select>
        {symbol === '__custom__' && (
          <input
            type="text"
            value={customSymbol}
            onChange={(e) => setCustomSymbol(e.target.value)}
            placeholder={assetType === 'crypto' ? 'e.g. LINK' : 'e.g. AMD'}
            className="mt-2 w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted font-mono uppercase"
            maxLength={10}
          />
        )}
      </div>

      {/* Alert type */}
      <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Alert Condition
        </label>
        <select
          value={alertType}
          onChange={(e) => setAlertType(e.target.value as AlertType)}
          className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-accent focus:ring-0 appearance-none"
        >
          {ALERT_TYPES.map((at) => (
            <option key={at.value} value={at.value}>{at.label}</option>
          ))}
        </select>
      </div>

      {/* Target value */}
      <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          {alertType.includes('percent') ? 'Percentage (%)' : 'Price ($)'}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-mono">
            {alertType.includes('percent') ? '%' : '$'}
          </span>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder={selectedAlertType.placeholder}
            min="0"
            step="any"
            className="w-full bg-surface-2 border border-white/10 rounded-lg pl-8 pr-3 py-2.5 text-sm text-white placeholder:text-muted font-mono"
            required
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-accent text-background font-semibold text-sm hover:bg-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating…
          </>
        ) : (
          '+ Create Alert'
        )}
      </button>
    </form>
  )
}
