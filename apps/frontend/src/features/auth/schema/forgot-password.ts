import { z } from "zod"

export const forgotPasswordSchema = z.object({
  email: z.pipe(
    z.string().min(1, { error: "Email is required" }),
    z.email({ error: "Enter a valid email address" }),
  ),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>