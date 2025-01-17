'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form' 
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = loginSchema

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

const resetPasswordSchema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

interface AuthFormProps {
  type: 'login' | 'register' | 'forgot-password' | 'reset-password'
  token?: string
  onSuccess?: () => void
}

type FormData = z.infer<typeof loginSchema | typeof forgotPasswordSchema | typeof resetPasswordSchema>

export function AuthForm({ type, token, onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Clear countdown when unmounting
  useEffect(() => {
    return () => {
      if (rateLimitCountdown !== null) {
        clearInterval(rateLimitCountdown);
      }
    };
  }, [rateLimitCountdown]);

  const handleRateLimit = (seconds: number) => {
    setRateLimitCountdown(seconds);
    const interval = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const schema = type === 'login' || type === 'register' 
    ? loginSchema 
    : type === 'forgot-password'
    ? forgotPasswordSchema
    : resetPasswordSchema

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      ...(type === 'reset-password' && { confirmPassword: '' })
    },
  })

  async function onSubmit(values: FormData) {
    setIsLoading(true)
    setError('')

    try {
      switch (type) {
        case 'login': {
          const { error } = await supabase.auth.signInWithPassword(values as z.infer<typeof loginSchema>)
          if (error) throw error
          router.push('/dashboard')
          break
        }
        case 'register': {
          const { error } = await supabase.auth.signUp(values as z.infer<typeof loginSchema>)
          if (error) throw error
          router.push('/dashboard')
          break
        }
        case 'forgot-password': {
          const { error } = await supabase.auth.resetPasswordForEmail(
            (values as z.infer<typeof forgotPasswordSchema>).email
          )
          if (error) throw error
          onSuccess?.()
          break
        }
        case 'reset-password': {
          if (!token) throw new Error('Reset token is required')
          const { error } = await supabase.auth.updateUser({
            password: (values as z.infer<typeof resetPasswordSchema>).password
          })
          if (error) throw error
          onSuccess?.()
          break
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        // Handle rate limit errors
        const message = error.message;
        if (message.includes('rate_limit')) {
          const seconds = parseInt(message.match(/\d+/)?.[0] || '60');
          handleRateLimit(seconds);
          setError(`Too many attempts. Please try again in ${seconds} seconds.`);
        } else {
          setError(message);
        }
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {type !== 'reset-password' && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(type === 'login' || type === 'register' || type === 'reset-password') && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder={type === 'reset-password' ? 'New password' : 'Password'}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {type === 'reset-password' && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin">⏳</div>
          ) : rateLimitCountdown ? (
            `Try again in ${rateLimitCountdown}s`
          ) : type === 'login' ? (
            'Sign in'
          ) : type === 'register' ? (
            'Sign up'
          ) : type === 'forgot-password' ? (
            'Send reset instructions'
          ) : (
            'Reset password'
          )}
        </Button>
      </form>
    </Form>
  )
}