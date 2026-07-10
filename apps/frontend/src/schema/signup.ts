import { z } from 'zod'

export const usernameSchema = z
  .string()
  .min(3, { error: 'Username must be 3–20 characters' })
  .max(20, { error: 'Username must be 3–20 characters' })
  .regex(/^[a-z]/, { error: 'Must start with a letter' })
  .regex(/^[a-z0-9._]+$/, {
    error: 'Allowed: lowercase letters, numbers, underscore, period',
  })
  .regex(/^(?!.*[_.]{2})/, { error: 'No consecutive special characters' })
  .regex(/[a-z0-9]$/, { error: 'Must end with a letter or number' })

export const signupSchema = z
  .object({
    fullName: z.string().min(1, { error: 'Name is required' }),
    username: usernameSchema,
    email: z.pipe(
      z.string().min(1, { error: 'Email is required' }),
      z.email({ error: 'Enter a valid email address' }),
    ),
    password: z
      .string()
      .min(1, { error: 'Password is required' })
      .min(6, { error: 'Password must be at least 6 characters' }),
    confirmPassword: z
      .string()
      .min(1, { error: 'Please confirm your password' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signupSchema>
