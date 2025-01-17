'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Database } from '@/lib/types/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  theme: z.enum(['light', 'dark']),
})

type FormData = z.infer<typeof formSchema>
type Profile = Database['public']['Tables']['profiles']['Row']

export default function SettingsAppearancePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { setTheme } = useTheme()
  const supabase = createClient()
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: 'light',
    },
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) {
          setProfile(data)
          form.reset({
            theme: data.theme,
          })
          setTheme(data.theme)
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function onSubmit(values: FormData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ theme: values.theme })
          .eq('id', user.id)
        setTheme(values.theme)
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the app.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the theme for the dashboard.
                </FormDescription>
              </FormItem>
            )}
          />
          <Button type="submit">Save preferences</Button>
        </form>
      </Form>
    </div>
  )
}