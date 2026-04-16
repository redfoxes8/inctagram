"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import s from "./s.module.css"
import { Icon } from "../Icon"

interface CheckboxProps {
  label?: string
  id: string
  disabled?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox = ({ label, id, disabled, checked, onCheckedChange }: CheckboxProps) => {
  return (
    <div className={s.container}>
      <CheckboxPrimitive.Root
        className={s.root}
        id={id}
        disabled={disabled}
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <CheckboxPrimitive.Indicator className={s.indicator}>
          <Icon name={"checkmark-outline"} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {label && (
        <label className={s.label} htmlFor={id}>
          {label}
        </label>
      )}
    </div>
  )
}
