import { z } from 'zod'
import { usernameSchema } from '#/schema/signup'

export const loginSchema = z
  .object({
    email: z.string().min(1, { error: 'Email or username is required' }),
    password: z.string().min(1, { error: 'Password is required' }),
  })
  .superRefine((data, ctx) => {
    if (data.email.includes('@')) {
      if (!z.email().safeParse(data.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid email address',
          path: ['email'],
        })
      }
    } else {
      const result = usernameSchema.safeParse(data.email)
      if (!result.success) {
        const issue = result.error.issues[0]
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: ['email'],
        })
      }
    }
  })

export type LoginFormData = z.infer<typeof loginSchema>
