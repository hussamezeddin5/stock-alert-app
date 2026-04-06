import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto mb-6 glow-accent">
          <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          You&apos;re all set!
        </h1>
        <p className="text-muted text-base leading-relaxed mb-8">
          Your subscription is active. Start creating price alerts for your
          favorite stocks and cryptocurrencies.
        </p>

        {/* What's next */}
        <div className="bg-surface border border-white/10 rounded-2xl p-6 text-left mb-8">
          <h2 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
            What to do next
          </h2>
          <ul className="space-y-3">
            {[
              { icon: '🔔', text: 'Create your first price alert' },
              { icon: '₿', text: 'Track BTC, ETH, or any crypto' },
              { icon: '📈', text: 'Monitor your favorite stocks' },
              { icon: '📧', text: 'Get emailed when targets are hit' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-base">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/dashboard"
          className="inline-block w-full py-4 rounded-xl bg-accent text-background font-bold text-base hover:bg-accent-dim transition-all glow-accent"
        >
          Go to Dashboard →
        </Link>

        <p className="text-xs text-muted mt-4">
          You&apos;ll receive a receipt from Stripe by email.
        </p>
      </div>
    </div>
  )
}
