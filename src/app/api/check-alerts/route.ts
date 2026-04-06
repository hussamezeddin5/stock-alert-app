import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAlertEmail } from '@/lib/resend'
import type { Alert } from '@/types'

// Lazily create the service-role client inside the handler
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface PriceInfo {
  price: number
  change24hPercent: number | null
}

// --- Price fetchers ---

async function getCryptoPriceMap(symbols: string[]): Promise<Map<string, PriceInfo>> {
  const map = new Map<string, PriceInfo>()

  // CoinGecko ID mapping for common symbols
  const symbolToId: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    BNB: 'binancecoin',
    SOL: 'solana',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    XRP: 'ripple',
    AVAX: 'avalanche-2',
    MATIC: 'matic-network',
    DOT: 'polkadot',
    LINK: 'chainlink',
    UNI: 'uniswap',
    LTC: 'litecoin',
    ATOM: 'cosmos',
    FTM: 'fantom',
  }

  const ids = symbols
    .map((s) => symbolToId[s.toUpperCase()])
    .filter(Boolean)
    .join(',')

  if (!ids) return map

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { cache: 'no-store' }
    )

    if (!res.ok) return map

    const data = await res.json()

    // Reverse-map: id → symbol
    const idToSymbol = Object.fromEntries(
      Object.entries(symbolToId).map(([sym, id]) => [id, sym])
    )

    for (const [id, values] of Object.entries(data)) {
      const v = values as { usd: number; usd_24h_change: number }
      const symbol = idToSymbol[id]
      if (symbol) {
        map.set(symbol, {
          price: v.usd,
          change24hPercent: v.usd_24h_change ?? null,
        })
      }
    }
  } catch (err) {
    console.error('CoinGecko fetch error:', err)
  }

  return map
}

async function getStockPriceMap(symbols: string[]): Promise<Map<string, PriceInfo>> {
  const map = new Map<string, PriceInfo>()
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY

  if (!apiKey || symbols.length === 0) return map

  // Alpha Vantage free tier: 5 requests/min, 25/day
  // Fetch sequentially with a small delay to avoid rate limits
  for (const symbol of symbols) {
    try {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
        { cache: 'no-store' }
      )

      if (!res.ok) continue

      const data = await res.json()
      const quote = data['Global Quote']

      if (!quote || !quote['05. price']) continue

      const price = parseFloat(quote['05. price'])
      const changePercent = parseFloat(
        quote['10. change percent']?.replace('%', '') ?? '0'
      )

      map.set(symbol.toUpperCase(), {
        price,
        change24hPercent: isNaN(changePercent) ? null : changePercent,
      })

      // 200ms delay between requests to respect rate limits
      await new Promise((r) => setTimeout(r, 200))
    } catch (err) {
      console.error(`Alpha Vantage fetch error for ${symbol}:`, err)
    }
  }

  return map
}

// --- Alert condition checker ---

function isTriggered(alert: Alert, priceInfo: PriceInfo): boolean {
  const { price, change24hPercent } = priceInfo

  switch (alert.alert_type) {
    case 'price_below':
      return price <= alert.target_value

    case 'price_above':
      return price >= alert.target_value

    case 'price_drop_percent':
      return (
        change24hPercent !== null && change24hPercent <= -Math.abs(alert.target_value)
      )

    case 'price_rise_percent':
      return (
        change24hPercent !== null && change24hPercent >= Math.abs(alert.target_value)
      )

    default:
      return false
  }
}

// --- Main handler ---

export async function GET(request: NextRequest) {
  // Protect this endpoint: only allow Vercel Cron or requests with the service key
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getServiceClient()

    // Fetch all non-triggered alerts for subscribed users
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select(`
        *,
        users!inner(email, subscribed)
      `)
      .eq('triggered', false)
      .eq('users.subscribed', true)

    if (error) {
      console.error('Fetch alerts error:', error)
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
    }

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ checked: 0, triggered: 0 })
    }

    // Group symbols by asset type
    const cryptoSymbols = Array.from(
      new Set(
        alerts
          .filter((a: Alert & { users: { email: string } }) => a.asset_type === 'crypto')
          .map((a: Alert) => a.symbol)
      )
    ) as string[]

    const stockSymbols = Array.from(
      new Set(
        alerts
          .filter((a: Alert & { users: { email: string } }) => a.asset_type === 'stock')
          .map((a: Alert) => a.symbol)
      )
    ) as string[]

    // Fetch prices in parallel
    const [cryptoMap, stockMap] = await Promise.all([
      getCryptoPriceMap(cryptoSymbols),
      getStockPriceMap(stockSymbols),
    ])

    const triggeredAlerts: string[] = []

    for (const alert of alerts) {
      const priceMap = alert.asset_type === 'crypto' ? cryptoMap : stockMap
      const priceInfo = priceMap.get(alert.symbol)

      if (!priceInfo) continue

      if (isTriggered(alert, priceInfo)) {
        // Mark as triggered
        const { error: updateError } = await supabase
          .from('alerts')
          .update({ triggered: true })
          .eq('id', alert.id)

        if (updateError) {
          console.error(`Failed to update alert ${alert.id}:`, updateError)
          continue
        }

        triggeredAlerts.push(alert.id)

        // Send email
        const userEmail = (alert as Alert & { users: { email: string } }).users?.email
        if (userEmail) {
          try {
            await sendAlertEmail({
              to: userEmail,
              symbol: alert.symbol,
              alertType: alert.alert_type,
              targetValue: alert.target_value,
              currentPrice: priceInfo.price,
            })
          } catch (emailErr) {
            console.error(`Failed to send email for alert ${alert.id}:`, emailErr)
          }
        }
      }
    }

    return NextResponse.json({
      checked: alerts.length,
      triggered: triggeredAlerts.length,
      triggeredIds: triggeredAlerts,
    })
  } catch (err) {
    console.error('check-alerts error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
