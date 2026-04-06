'use client'

import { useEffect, useState } from 'react'

interface TickerItem {
  symbol: string
  label: string
  price: number | null
  change24h: number | null
}

const INITIAL_ITEMS: TickerItem[] = [
  { symbol: 'BTC', label: 'Bitcoin', price: null, change24h: null },
  { symbol: 'ETH', label: 'Ethereum', price: null, change24h: null },
  { symbol: 'SPY', label: 'S&P 500', price: null, change24h: null },
]

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>(INITIAL_ITEMS)
  const [loading, setLoading] = useState(true)

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/prices')
      if (!res.ok) return
      const data = await res.json()

      setItems((prev) =>
        prev.map((item) => {
          const found = data.find((d: { symbol: string; price: number; change24h: number | null }) => d.symbol === item.symbol)
          return found ? { ...item, price: found.price, change24h: found.change24h } : item
        })
      )
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 60_000) // refresh every minute
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number | null, symbol: string) => {
    if (price === null) return '—'
    if (symbol === 'BTC') return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    if (symbol === 'ETH') return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatChange = (change: number | null) => {
    if (change === null) return null
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  // Duplicate items for seamless loop
  const displayItems = [...items, ...items]

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-surface/50 py-3">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10 bg-gradient-to-l from-background to-transparent" />

      <div
        className="ticker-track flex gap-12 whitespace-nowrap"
        style={{ width: 'max-content' }}
      >
        {displayItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                item.change24h !== null && item.change24h >= 0 ? 'bg-accent' : 'bg-danger'
              } ${loading ? 'opacity-30' : ''}`} />
              <span className="text-sm font-semibold text-white font-mono">{item.symbol}</span>
              <span className="text-xs text-muted">{item.label}</span>
            </div>
            <span className="text-sm font-mono font-semibold text-white">
              {loading ? (
                <span className="inline-block w-16 h-4 bg-surface-2 rounded animate-pulse" />
              ) : (
                formatPrice(item.price, item.symbol)
              )}
            </span>
            {!loading && item.change24h !== null && (
              <span className={`text-xs font-mono font-semibold ${
                item.change24h >= 0 ? 'text-accent' : 'text-danger'
              }`}>
                {formatChange(item.change24h)}
              </span>
            )}
            <span className="text-white/10 ml-4">|</span>
          </div>
        ))}
      </div>
    </div>
  )
}
