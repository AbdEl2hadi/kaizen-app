import {z} from "zod"

const envSchema = z.object({
  VITE_SERVER_URL: z.url().default('http://localhost:4040'),
  VITE_APP_ENV : z.enum(["development" , "production"]).default("development")
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    'Invalid environment variables:\n' +
      parsed.error.issues
        .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
        .join('\n'),
  )
}

export const env = parsed.data