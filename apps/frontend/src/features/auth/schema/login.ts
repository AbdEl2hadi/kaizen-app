import { z } from 'zod'
import { usernameSchema } from '#/features/auth/schema/signup'

export const loginSchema = z
  .object({
    identity: z.string().min(1, { error: 'Email or username is required' }),
    password: z.string().min(1, { error: 'Password is required' }),
  })
  .superRefine((data, ctx) => {
    if (data.identity.includes('@')) {
      if (!z.email().safeParse(data.identity).success) {
        ctx.addIssue({
          code: "custom",
          message: 'Enter a valid email address',
          path: ['email'],
        })
      }
    } else {
      const result = usernameSchema.safeParse(data.identity)
      if (!result.success) {
        const issue = result.error.issues[0]
        ctx.addIssue({
          code: "custom",
          message: issue.message,
          path: ['email'],
        })
      }
    }
  })

export type LoginFormData = z.infer<typeof loginSchema>
