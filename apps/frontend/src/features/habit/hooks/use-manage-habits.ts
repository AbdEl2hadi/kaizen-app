import { useCallback, useState } from 'react'

import { addHabitSchema, habitNameSchema } from '../schema/habit'
import type { Habit, HabitInput, HabitInputType } from '../types'
import {
  useActiveHabits,
  useArchiveHabit,
  useCreateHabit,
  useRestoreHabit,
  useUpdateHabit,
} from './use-habit-manage'

const DEFAULT_ICON = 'Dumbbell'

function inputConfigFor(input: HabitInput) {
  if (input.type === 'select' || input.type === 'multiselect') return { options: input.options }
  if (input.type === 'number') return { target: input.target }
  return undefined
}

export function useManageHabits() {
  const createHabit = useCreateHabit()
  const updateHabit = useUpdateHabit()
  const archiveHabit = useArchiveHabit()
  const restoreHabit = useRestoreHabit()
  const { data: activeHabits = [] } = useActiveHabits()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState(DEFAULT_ICON)
  const [iconDialogOpen, setIconDialogOpen] = useState(false)
  const [inputType, setInputType] = useState<HabitInputType>('checkbox')
  const [optionsText, setOptionsText] = useState('')
  const [targetText, setTargetText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editIconDialogOpen, setEditIconDialogOpen] = useState(false)

  const parsedOptions = useCallback(
    () =>
      optionsText
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean),
    [optionsText]
  )

  const resetForm = useCallback(() => {
    setName('')
    setIcon(DEFAULT_ICON)
    setInputType('checkbox')
    setOptionsText('')
    setTargetText('')
  }, [])

  const addHabit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const input =
        inputType === 'select' || inputType === 'multiselect'
          ? { type: inputType, options: parsedOptions() }
          : inputType === 'number'
            ? { type: inputType, target: Number(targetText) }
            : { type: inputType }
      const parsed = addHabitSchema.safeParse({ name, icon, input })
      if (!parsed.success) return
      const sortOrder =
        activeHabits.reduce((max, h) => Math.max(max, h.sortOrder ?? 0), 0) + 1
      createHabit.mutate({
        name: parsed.data.name,
        icon: parsed.data.icon,
        inputType: parsed.data.input.type,
        inputConfig: inputConfigFor(parsed.data.input),
        sortOrder,
      })
      resetForm()
    },
    [activeHabits, createHabit, icon, inputType, name, parsedOptions, resetForm, targetText]
  )

  const startEdit = useCallback((habit: Habit) => {
    setEditingId(habit.id)
    setEditName(habit.name)
    setEditIcon(habit.icon)
  }, [])

  const saveEdit = useCallback(
    (id: string) => {
      if (!habitNameSchema.safeParse(editName).success) return
      updateHabit.mutate({ habitId: id, name: editName.trim(), icon: editIcon })
      setEditingId(null)
    },
    [editIcon, editName, updateHabit]
  )

  const archive = useCallback(
    (id: string) => archiveHabit.mutate({ habitId: id }),
    [archiveHabit]
  )

  const restore = useCallback(
    (id: string) => restoreHabit.mutate({ habitId: id }),
    [restoreHabit]
  )

  return {
    form: {
      name,
      setName,
      icon,
      setIcon,
      iconDialogOpen,
      setIconDialogOpen,
      inputType,
      setInputType,
      optionsText,
      setOptionsText,
      targetText,
      setTargetText,
    },
    edit: {
      editingId,
      setEditingId,
      editName,
      setEditName,
      editIcon,
      setEditIcon,
      editIconDialogOpen,
      setEditIconDialogOpen,
    },
    actions: { addHabit, startEdit, saveEdit, archive, restore },
  }
}