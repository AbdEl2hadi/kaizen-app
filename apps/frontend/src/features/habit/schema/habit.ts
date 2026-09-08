import { z } from 'zod'

import { ALL_ICONS } from '../data/icons'

export const habitNameSchema = z
  .string()
  .trim()
  .min(1, { error: 'Habit name is required' })
  .max(60, { error: 'Keep it under 60 characters' })

export const goalTitleSchema = z
  .string()
  .trim()
  .min(1, { error: 'Goal title is required' })
  .max(120, { error: 'Keep it under 120 characters' })

export const habitInputTypeSchema = z.enum([
  'checkbox',
  'text',
  'number',
  'select',
  'multiselect',
  'percent',
  'date',
  'files',
  'url',
])

export const habitInputSchema = z
  .object({
    type: habitInputTypeSchema,
    options: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
    target: z.number().int().positive().optional(),
  })
  .superRefine((input, ctx) => {
    if (
      (input.type === 'select' || input.type === 'multiselect') &&
      (!input.options || input.options.length === 0)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Add at least one option',
      })
    }
    if (input.type === 'number' && (input.target == null || input.target <= 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['target'],
        message: 'Enter the max value',
      })
    }
  })

export const addHabitSchema = z.object({
  name: habitNameSchema,
  icon: z.enum(ALL_ICONS, { error: 'Pick an icon' }),
  input: habitInputSchema,
})

export const habitIdSchema = z.string().min(1)

/** Flat payload for `POST /habits` (backend contract). */
export const createHabitSchema = z.object({
  name: habitNameSchema,
  icon: z.enum(ALL_ICONS, { error: 'Pick an icon' }),
  inputType: habitInputTypeSchema,
  inputConfig: z
    .object({
      options: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
      target: z.number().int().positive().optional(),
    })
    .optional(),
  sortOrder: z.number().int().positive(),
})

/** Flat payload for `PATCH /habits/{habitID}` (rename + icon). */
export const updateHabitSchema = z.object({
  habitId: habitIdSchema,
  name: habitNameSchema,
  icon: z.enum(ALL_ICONS, { error: 'Pick an icon' }),
})

export const addGoalSchema = z.object({
  title: goalTitleSchema,
  due: z.enum(['today', 'week', 'none']),
  priority: z.enum(['low', 'med', 'high']),
})

export const noteSchema = z.string().max(200, { error: 'Keep it under 200 characters' })

export type AddHabitData = z.infer<typeof addHabitSchema>
export type AddGoalData = z.infer<typeof addGoalSchema>
