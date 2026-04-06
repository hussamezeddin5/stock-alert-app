import Link from 'next/link'
import LiveTicker from '@/components/LiveTicker'

const FEATURES = [
  {
    icon: '📊',
    title: 'Multi-Asset Coverage',
    description: 'Monitor stocks and cryptocurrencies in one place. BTC, ETH, AAPL, TSLA, and thousands more.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Monitoring',
    description: 'Prices are checked every 15 minutes. You\'ll never miss an important move.',
  },
  {
    icon: '📧',
    title: 'Instant Email Alerts',
    description: 'Get notified the moment your price target is hit. No app required.',
  },
  {
    icon: '🎯',
    title: 'Flexible Conditions',
    description: 'Set alerts for price levels or percentage moves. Both directions, any asset.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your alerts and data are encrypted and never shared with third parties.',
  },
  {
    icon: '📱',
    title: 'Works Everywhere',
    description: 'Manage your alerts from any device. Fully responsive and mobile-friendly.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Live Ticker */}
      <LiveTicker />

      {/* Hero */}
      <section className="relative grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 sm:py-36 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold text-accent tracking-wide uppercase">Live Price Monitoring</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Never Miss a{' '}
            <span className="text-accent glow-text">Price Move</span>
            {' '}Again
          </h1>

          <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Set custom price alerts for stocks and crypto. Get instant email notifications
            when your targets are hit — while you live your life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth?mode=signup"
              className="px-8 py-4 rounded-xl bg-accent text-background font-bold text-base hover:bg-accent-dim transition-all glow-accent btn-pulse"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-xl border border-white/10 text-white font-semibold text-base hover:border-white/30 hover:bg-white/5 transition-all"
            >
              View Pricing
            </Link>
          </div>

          <p className="text-xs text-muted mt-6">
            $15/month · Cancel anytime · No credit card for trial
          </p>
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="border-y border-white/5 bg-surface/30">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '10,000+', label: 'Alerts Sent' },
              { value: '15 min', label: 'Check Interval' },
              { value: '99.9%', label: 'Uptime' },
              { value: '2 min', label: 'Setup Time' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold text-accent font-mono">{stat.value}</div>
                <div className="text-xs text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alert types showcase */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Powerful Alert Conditions</h2>
          <p className="text-muted">Four ways to catch the moves that matter to you</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: '↓',
              color: 'text-danger',
              bg: 'bg-danger/10 border-danger/20',
              title: 'Price Goes Below',
              desc: 'Alert me when BTC drops below $60,000',
              example: 'BTC < $60,000',
            },
            {
              icon: '↑',
              color: 'text-accent',
              bg: 'bg-accent/10 border-accent/20',
              title: 'Price Goes Above',
              desc: 'Alert me when AAPL rises above $220',
              example: 'AAPL > $220',
            },
            {
              icon: '📉',
              color: 'text-orange-400',
              bg: 'bg-orange-500/10 border-orange-500/20',
              title: 'Drops by X% in 24h',
              desc: 'Alert me if ETH drops 15% in a day',
              example: 'ETH −15% / 24h',
            },
            {
              icon: '📈',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10 border-blue-500/20',
              title: 'Rises by X% in 24h',
              desc: 'Alert me if NVDA pumps 20% today',
              example: 'NVDA +20% / 24h',
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`rounded-2xl border p-5 ${item.bg} bg-surface/50`}
            >
              <div className="flex items-start gap-4">
                <span className={`text-2xl ${item.color}`}>{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-muted mt-1">{item.desc}</p>
                  <code className={`text-sm font-mono mt-2 inline-block ${item.color}`}>
                    {item.example}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-surface/20 border-y border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
            <p className="text-muted">Professional-grade alerts without the complexity</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/5 bg-surface p-6 hover:border-accent/20 transition-colors"
              >
                <span className="text-3xl">{feature.icon}</span>
                <h3 className="font-semibold text-white mt-3 mb-2">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-muted mb-8">
          One plan. Everything included. Cancel anytime.
        </p>
        <div className="rounded-2xl border border-accent/30 bg-surface p-8 glow-accent">
          <div className="text-5xl font-bold text-white font-mono mb-1">
            $15
            <span className="text-xl text-muted font-normal">/mo</span>
          </div>
          <p className="text-muted text-sm mb-6">Billed monthly · Cancel anytime</p>
          <ul className="text-sm text-left space-y-3 mb-8">
            {[
              'Unlimited price alerts',
              'Stocks + Crypto coverage',
              'Email notifications',
              'Real-time price monitoring',
              'All 4 alert condition types',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="text-accent font-bold">✓</span>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/auth?mode=signup"
            className="block w-full py-3 rounded-xl bg-accent text-background font-bold hover:bg-accent-dim transition-colors"
          >
            Get Started — $15/mo
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 bg-surface/20">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to trade smarter?
          </h2>
          <p className="text-muted mb-8">
            Join traders and investors who never miss their target price.
          </p>
          <Link
            href="/auth?mode=signup"
            className="inline-block px-10 py-4 rounded-xl bg-accent text-background font-bold text-lg hover:bg-accent-dim transition-all glow-accent"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted">
            © {new Date().getFullYear()} AlertTrader. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/auth" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
