import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

const resetPasswordSchema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string()
})

export type FormData = 
  | z.infer<typeof loginSchema>
  | z.infer<typeof forgotPasswordSchema>
  | z.infer<typeof resetPasswordSchema>