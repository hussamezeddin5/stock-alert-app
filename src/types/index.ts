export type AlertType =
  | 'price_drop_percent'
  | 'price_rise_percent'
  | 'price_below'
  | 'price_above'

export type AssetType = 'crypto' | 'stock'

export interface Alert {
  id: string
  user_id: string
  symbol: string
  asset_type: AssetType
  alert_type: AlertType
  target_value: number
  triggered: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  subscribed: boolean
  stripe_customer_id: string | null
  created_at: string
}

export interface PriceData {
  symbol: string
  price: number
  change24h: number | null
}

export interface AlertCheckResult {
  alert: Alert
  triggered: boolean
  currentPrice: number
}
