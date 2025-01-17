'use client'

import { useState } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const [resetComplete, setResetComplete] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                This password reset link is invalid or has expired. Please request a new password reset.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Set New Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resetComplete ? (
            <Alert>
              <AlertDescription>
                Your password has been reset successfully. You can now sign in with your new password.
              </AlertDescription>
            </Alert>
          ) : (
            <AuthForm 
              type="reset-password" 
              token={token}
              onSuccess={() => {
                setResetComplete(true)
                setTimeout(() => router.push('/login'), 2000)
              }} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}