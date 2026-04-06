import { NextResponse } from 'next/server'

interface PriceResult {
  symbol: string
  price: number
  change24h: number | null
}

async function getCryptoPrices(): Promise<PriceResult[]> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
    { next: { revalidate: 60 } }
  )

  if (!res.ok) return []

  const data = await res.json()
  return [
    {
      symbol: 'BTC',
      price: data.bitcoin?.usd ?? 0,
      change24h: data.bitcoin?.usd_24h_change ?? null,
    },
    {
      symbol: 'ETH',
      price: data.ethereum?.usd ?? 0,
      change24h: data.ethereum?.usd_24h_change ?? null,
    },
  ]
}

async function getSPYPrice(): Promise<PriceResult | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${apiKey}`,
      { next: { revalidate: 60 } }
    )

    if (!res.ok) return null
    const data = await res.json()
    const quote = data['Global Quote']

    if (!quote || !quote['05. price']) return null

    return {
      symbol: 'SPY',
      price: parseFloat(quote['05. price']),
      change24h: parseFloat(quote['10. change percent']?.replace('%', '') ?? '0'),
    }
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const [cryptoPrices, spyPrice] = await Promise.all([
      getCryptoPrices(),
      getSPYPrice(),
    ])

    const results: PriceResult[] = [
      ...cryptoPrices,
      ...(spyPrice ? [spyPrice] : []),
    ]

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
