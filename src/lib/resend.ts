import { Resend } from 'resend'

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

export async function sendAlertEmail({
  to,
  symbol,
  alertType,
  targetValue,
  currentPrice,
}: {
  to: string
  symbol: string
  alertType: string
  targetValue: number
  currentPrice: number
}) {
  const subject = `Alert Triggered: ${symbol}`

  const alertDescriptions: Record<string, string> = {
    price_drop_percent: `dropped by ${targetValue}% in 24 hours`,
    price_rise_percent: `rose by ${targetValue}% in 24 hours`,
    price_below: `fell below $${targetValue}`,
    price_above: `rose above $${targetValue}`,
  }

  const description = alertDescriptions[alertType] ?? 'met your alert condition'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Alert Triggered</title>
      </head>
      <body style="background:#0f0f0f;color:#e5e7eb;font-family:Inter,sans-serif;padding:40px 20px;">
        <div style="max-width:520px;margin:0 auto;background:#1a1a1a;border-radius:12px;padding:32px;border:1px solid #242424;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:32px;">📊</span>
            <h1 style="color:#00ff88;font-size:24px;margin:8px 0 0;">Alert Triggered</h1>
          </div>
          <p style="font-size:16px;line-height:1.6;color:#d1d5db;">
            Your price alert for <strong style="color:#fff;">${symbol}</strong> has been triggered.
          </p>
          <div style="background:#242424;border-radius:8px;padding:16px;margin:20px 0;border-left:3px solid #00ff88;">
            <p style="margin:0;color:#9ca3af;font-size:14px;">Condition</p>
            <p style="margin:4px 0 0;color:#fff;font-size:16px;font-weight:600;">${symbol} ${description}</p>
          </div>
          <div style="background:#242424;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="margin:0;color:#9ca3af;font-size:14px;">Current Price</p>
            <p style="margin:4px 0 0;color:#00ff88;font-size:24px;font-weight:700;font-family:monospace;">$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <p style="font-size:13px;color:#6b7280;margin-top:24px;">
            This alert has been marked as triggered and will not fire again. Log in to create a new alert.
          </p>
          <div style="text-align:center;margin-top:24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
               style="background:#00ff88;color:#0f0f0f;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
              Manage Alerts
            </a>
          </div>
        </div>
      </body>
    </html>
  `

  const resend = getResendClient()
  await resend.emails.send({
    from: 'alerts@yourdomain.com',
    to,
    subject,
    html,
  })
}
