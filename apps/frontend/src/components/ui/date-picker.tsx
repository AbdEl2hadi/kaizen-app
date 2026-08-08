"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "#/lib/utils"
import { Button } from "#/components/ui/button"
import { Calendar } from "#/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover"

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
}: {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start rounded-xl border-[#e0e0e0] px-3 py-2 text-xs font-normal text-kaizen-charcoal sm:px-4 sm:py-2.5 sm:text-sm",
            "dark:border-[#333] dark:bg-[#1a1d1b] dark:text-white",
            !value && "text-kaizen-gray-light",
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0 text-kaizen-gray-light" />
          <span className="truncate">{value ? value.toLocaleDateString() : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto rounded-xl border-[#e0e0e0] p-0 shadow-lg dark:border-[#333] dark:bg-[#1a1d1b]"
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          captionLayout="dropdown"
          classNames={{
            dropdown_root:
              "relative rounded-lg border border-[#e0e0e0] shadow-xs has-focus:border-kaizen-primary has-focus:ring-[3px] has-focus:ring-kaizen-primary/30 dark:border-[#444] dark:bg-[#1a1d1b]",
            dropdown:
              "absolute inset-0 bg-white opacity-0 dark:bg-[#1a1d1b]",
          }}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
