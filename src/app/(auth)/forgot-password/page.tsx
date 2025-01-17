'use client'

import { useState } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailSent ? (
            <Alert>
              <AlertDescription>
                If an account exists with that email, you will receive password reset instructions.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <AuthForm type="forgot-password" onSuccess={() => setEmailSent(true)} />
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Remember your password? </span>
                <Button variant="link" className="p-0" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}