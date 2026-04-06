import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Get user profile (subscribed status)
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user alerts
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardClient
      user={user}
      profile={profile}
      initialAlerts={alerts ?? []}
    />
  )
}
