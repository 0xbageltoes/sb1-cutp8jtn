'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Database } from '@/lib/types/supabase'
import { Skeleton } from '@/components/ui/skeleton'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <div className="space-y-8">
          <Skeleton className="h-14 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="relative h-[200px] overflow-hidden">
        {profile?.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Profile banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </Card>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="relative -mt-20 h-32 w-32 overflow-hidden rounded-full border-4 border-background">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile?.full_name || 'Profile picture'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-4xl">
                  {profile?.full_name?.[0] || profile?.email[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {profile?.full_name || 'Anonymous User'}
            </h1>
            <p className="text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}