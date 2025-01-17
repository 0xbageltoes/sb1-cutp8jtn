'use client'

import { AuthForm } from '@/components/auth/auth-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthForm type="login" />
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Button variant="link" className="p-0" asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
          <div className="text-center text-sm">
            <Button variant="link" className="p-0" asChild>
              <Link href="/forgot-password">Forgot password?</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}