'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

const FEATURES = [
  'Unlimited price alerts',
  'Stocks & Crypto coverage',
  'Email notifications within 15 minutes',
  'Price level alerts (above / below)',
  'Percentage move alerts (24h)',
  'Real-time dashboard',
  'Cancel anytime',
]

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/auth?mode=signup'
        return
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to start checkout.')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="mx-auto max-w-2xl px-4 py-20">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Simple Pricing
          </h1>
          <p className="text-muted text-lg">
            One plan. Everything included. No hidden fees.
          </p>
        </div>

        {/* Pricing card */}
        <div className="relative rounded-2xl border border-accent/30 bg-surface p-8 glow-accent">
          {/* Popular badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="bg-accent text-background text-xs font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </span>
          </div>

          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-white font-mono">
              $15
              <span className="text-xl font-normal text-muted">/month</span>
            </div>
            <p className="text-muted text-sm mt-2">Billed monthly · Cancel anytime</p>
          </div>

          <ul className="space-y-4 mb-8">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {error && (
            <p className="mb-4 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-accent text-background font-bold text-base hover:bg-accent-dim transition-all glow-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting to Stripe…
              </>
            ) : (
              'Subscribe Now — $15/mo'
            )}
          </button>

          <p className="text-center text-xs text-muted mt-4">
            Secure payment via{' '}
            <span className="text-white font-semibold">Stripe</span>
            {' '}· SSL encrypted
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16 space-y-6">
          <h2 className="text-xl font-bold text-white text-center">Common Questions</h2>
          {[
            {
              q: 'How does billing work?',
              a: 'You\'re charged $15 every month. Cancel any time from your Stripe billing portal — no questions asked.',
            },
            {
              q: 'How quickly do I get alerted?',
              a: 'Prices are checked every 15 minutes. You\'ll receive an email within 15 minutes of your alert condition being met.',
            },
            {
              q: 'Which assets are supported?',
              a: 'We support all major cryptocurrencies (via CoinGecko) and US-listed stocks (via Alpha Vantage), including ETFs like SPY and QQQ.',
            },
            {
              q: 'What happens if my payment fails?',
              a: 'Your subscription will be paused and alerts will stop until payment succeeds. We\'ll send you an email to update your payment method.',
            },
          ].map((faq) => (
            <div key={faq.q} className="border border-white/5 rounded-xl p-5 bg-surface/50">
              <h3 className="font-semibold text-white text-sm mb-2">{faq.q}</h3>
              <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
