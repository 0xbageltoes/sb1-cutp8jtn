import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/supabase'

export function createClient(cookieStore?: { get: (name: string) => string | undefined }) {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore?.get(name)
        },
      },
    }
  )
}