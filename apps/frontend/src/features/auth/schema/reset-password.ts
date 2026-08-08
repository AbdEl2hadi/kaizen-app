import { z } from "zod"

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { error: "Reset token is required" }),
    password: z
      .string()
      .min(1, { error: "Password is required" })
      .min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(1, { error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>