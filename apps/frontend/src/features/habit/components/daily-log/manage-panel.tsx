import { Check, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '#/components/ui/drawer'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { useIsMobile } from '#/hooks/use-mobile'

import { lifetimeCompletion } from '../../lib/stats'
import { INPUT_TYPES } from '../../lib/inputs'
import { useLog } from '../../hooks/use-habit-data'
import { useActiveHabits, useArchivedHabits } from '../../hooks/use-habit-manage'
import { habitActions, useManageOpen } from '../../hooks/use-habit-store'
import { useManageHabits } from '../../hooks/use-manage-habits'
import { HabitIcon } from '../../lib/icon'
import { IconPicker } from './icon-picker'
import type { HabitInputType } from '../../types'

function IconPickerDialog({
  open,
  onOpenChange,
  value,
  onChange,
  title,
  description,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onChange: (icon: string) => void
  title: string
  description: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <IconPicker value={value} onChange={onChange} label={title} />
      </DialogContent>
    </Dialog>
  )
}

export function ManagePanel() {
  const { data: habits = [], isPending: activePending } = useActiveHabits()
  const { data: archivedHabits = [] } = useArchivedHabits()
  const log = useLog()
  const manageOpen = useManageOpen()
  const isMobile = useIsMobile()
  const {
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
  } = useManageHabits()

  return (
    <Drawer
      open={manageOpen}
      showSwipeHandle
      onOpenChange={(open) => habitActions.setManageOpen(open)}
      swipeDirection={isMobile ? 'down' : 'right'}
    >
      <DrawerContent className="sm:max-w-100">
        <DrawerHeader className="border-b border-border/60">
          <DrawerTitle>Manage Habits</DrawerTitle>
          <DrawerDescription>
            Add, edit, or archive habits from your daily log.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <form
            onSubmit={addHabit}
            className="rounded-lg border border-border bg-muted/50 p-3"
            aria-label="Add a habit"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              New habit
            </p>
            <div className="flex flex-col items-start gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIconDialogOpen(true)}
                className="shrink-0 "
              >
                <HabitIcon name={icon} className="size-4" />
                Choose icon
              </Button>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Habit name…"
                aria-label="Habit name"
                maxLength={60}
              />
              <Select value={inputType} onValueChange={(v) => setInputType(v as HabitInputType)}>
                <SelectTrigger size="sm" aria-label="Input type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INPUT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(inputType === 'select' || inputType === 'multiselect') && (
                <textarea
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  placeholder={'One option per line\nWorkout\nRead\nMeditate'}
                  aria-label="Options (one per line)"
                  rows={3}
                  className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              )}
              {inputType === 'number' && (
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={targetText}
                  onChange={(e) => setTargetText(e.target.value)}
                  placeholder="Max value (e.g. 8 for 8h)"
                  aria-label="Max value"
                  className="h-8 text-sm"
                />
              )}
              <Button
                type="submit"
                disabled={!name.trim()}
                size="sm"
                className="shrink-0"
              >
                <Plus className="size-4" aria-hidden />
                Add Habit
              </Button>
            </div>
          </form>

          <div className="mt-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Active habits
            </p>
            {activePending ? (
              <ul className="space-y-1.5" aria-label="Loading active habits">
                {[0, 1, 2].map((i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2.5"
                  >
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : habits.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                No active habits — add one above.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {habits.map((h) => {
                  const life = lifetimeCompletion(log, h)
                  const editing = editingId === h.id
                  return (
                    <li key={h.id} className="group rounded-lg border border-border bg-card p-2.5">
                      {editing ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditIconDialogOpen(true)}
                              className="shrink-0"
                            >
                              <HabitIcon name={editIcon} className="size-4" />
                              Choose icon
                            </Button>
                            <Input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              aria-label="Edit habit name"
                              maxLength={60}
                            />
                            <Button
                              type="button"
                              onClick={() => saveEdit(h.id)}
                              aria-label="Save changes"
                              size="icon"
                              className="shrink-0"
                            >
                              <Check className="size-3.5" strokeWidth={3} />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setEditingId(null)}
                              aria-label="Cancel editing"
                              size="icon"
                              variant="ghost"
                              className="shrink-0"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground"
                          >
                            <HabitIcon name={h.icon} className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{h.name}</p>
                            <p className="text-xs tabular-nums text-muted-foreground">
                              lifetime {life}% ·{' '}
                              {INPUT_TYPES.find((t) => t.value === h.input.type)?.label ?? h.input.type}
                            </p>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => startEdit(h)}
                                aria-label={`Edit ${h.name}`}
                                className="cursor-pointer rounded-md p-1.5 text-muted-foreground opacity-100 transition-opacity duration-150 hover:bg-secondary hover:text-foreground focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => archive(h.id)}
                                aria-label={`Archive ${h.name}`}
                                className="cursor-pointer rounded-md p-1.5 text-muted-foreground opacity-100 transition-opacity duration-150 hover:bg-secondary hover:text-destructive focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Archive</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {archivedHabits.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Archived habits
              </p>
              <ul className="space-y-1.5">
                {archivedHabits.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 p-2.5"
                  >
                    <span
                      aria-hidden
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground"
                    >
                      <HabitIcon name={h.icon} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      {h.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => restore(h.id)}
                      className="flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-kaizen-primary/50 hover:text-kaizen-primary-dark dark:hover:text-kaizen-primary-light"
                    >
                      <RotateCcw className="size-3" aria-hidden />
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isMobile && (
          <DrawerFooter className="border-t border-border/60 pt-3">
            <Button onClick={() => habitActions.setManageOpen(false)}>Done</Button>
          </DrawerFooter>
        )}
      </DrawerContent>

      <IconPickerDialog
        open={iconDialogOpen}
        onOpenChange={setIconDialogOpen}
        value={icon}
        onChange={setIcon}
        title="Choose an icon"
        description="Pick an icon for your new habit."
      />
      <IconPickerDialog
        open={editIconDialogOpen}
        onOpenChange={setEditIconDialogOpen}
        value={editIcon}
        onChange={setEditIcon}
        title="Choose an icon"
        description="Pick an icon for this habit."
      />
    </Drawer>
  )
}