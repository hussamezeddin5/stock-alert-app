import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase-server'
import type { AlertType, AssetType } from '@/types'

const VALID_ALERT_TYPES: AlertType[] = [
  'price_drop_percent',
  'price_rise_percent',
  'price_below',
  'price_above',
]

const VALID_ASSET_TYPES: AssetType[] = ['crypto', 'stock']

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
    }

    return NextResponse.json(alerts)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription
    const serviceSupabase = await createServiceClient()
    const { data: profile } = await serviceSupabase
      .from('users')
      .select('subscribed')
      .eq('id', user.id)
      .single()

    if (!profile?.subscribed) {
      return NextResponse.json(
        { error: 'Active subscription required to create alerts.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { symbol, asset_type, alert_type, target_value } = body

    // Validate
    if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid symbol.' }, { status: 400 })
    }
    if (!VALID_ASSET_TYPES.includes(asset_type)) {
      return NextResponse.json({ error: 'Invalid asset type.' }, { status: 400 })
    }
    if (!VALID_ALERT_TYPES.includes(alert_type)) {
      return NextResponse.json({ error: 'Invalid alert type.' }, { status: 400 })
    }
    if (typeof target_value !== 'number' || target_value <= 0 || !isFinite(target_value)) {
      return NextResponse.json({ error: 'Invalid target value.' }, { status: 400 })
    }

    const { data: alert, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        symbol: symbol.trim().toUpperCase(),
        asset_type,
        alert_type,
        target_value,
        triggered: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert alert error:', error)
      return NextResponse.json({ error: 'Failed to create alert.' }, { status: 500 })
    }

    return NextResponse.json(alert, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
