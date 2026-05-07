"use client"

import * as Popover from "@radix-ui/react-popover"
import * as Label from "@radix-ui/react-label"
import { Calendar } from "./Calendar"
import clsx from "clsx"
import s from "./DateRangePicker.module.css"
import { Icon } from "../Icon"
import { useState } from "react"
import { getDisplayValue } from "./formatters"

type DatePickerMode = "single" | "range" | "multiple"

type BaseProps = {
  error?: string
  disabled?: boolean
  placeholder?: string
  label?: string
}

type SingleModeProps = BaseProps & {
  mode: "single"
  value?: Date
  onChange?: (date: Date | undefined) => void
}

type RangeModeProps = BaseProps & {
  mode: "range"
  value?: { from: Date; to?: Date }
  onChange?: (range: { from: Date; to?: Date } | undefined) => void
}

type MultipleModeProps = BaseProps & {
  mode: "multiple"
  value?: Date[]
  onChange?: (dates: Date[] | undefined) => void
}

type DateRangePickerProps = SingleModeProps | RangeModeProps | MultipleModeProps

export function DateRangePicker(props: DateRangePickerProps) {
  const { mode, error, disabled = false, placeholder = "22/01/2026", label = "Date", value, onChange } = props
  const [open, setOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const displayValue = getDisplayValue(mode, value, placeholder)

  const handleSelect = (val: any) => {
    if (mode === "single") {
      onChange?.(val)
      if (val) setOpen(false)
    } else if (mode === "range") {
      onChange?.(val)
      if (val?.from && val?.to) setOpen(false)
    } else if (mode === "multiple") {
      onChange?.(val || [])
    }
  }

  const getTriggerState = () => {
    if (disabled) return "disabled"
    if (error) return "error"
    if (open) return "active"
    if (isHovered) return "hover"
    return "default"
  }

  return (
    <div className={s.container}>
      <Label.Root
        className={clsx(s.labelRoot, "regular_text_14", {
          [s.labelError]: error,
          [s.labelDisabled]: disabled,
        })}
      >
        {label}
      </Label.Root>

      <Popover.Root open={open && !disabled} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            className={clsx(s.trigger, s[getTriggerState()], "medium_text_14")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className={clsx(s.value, "regular_text_16", { [s.placeholder]: !value })}>{displayValue}</span>
            <Icon className={s.icon} name="calendar" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content className={s.popoverContent} align="start" sideOffset={4}>
            <Calendar mode={mode} selected={value} onSelect={handleSelect} disabled={disabled} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {error && <div className={s.errorMessage}>{error}</div>}
    </div>
  )
}
