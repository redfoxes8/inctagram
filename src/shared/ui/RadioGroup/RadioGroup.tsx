"use client"

import React, { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react"
import * as RadioGroupRadix from "@radix-ui/react-radio-group"
import s from "./RadioGroup.module.css"
import { Icon } from "@/shared/ui/Icon"
import clsx from "clsx"

type Option = {
    label: string
    value: string
}

type RadioGroupRootProps = ComponentPropsWithoutRef<typeof RadioGroupRadix.Root>

export type RadioGroupProps = {
    disabled?: boolean
    onChange?: (value: string) => void
    options: Option[]
    value?: string
} & Omit<RadioGroupRootProps, "onValueChange" | "value">

// НЕ УДАЛЯТЬ КОММЕНТ ПЕРЕД forwardRef - без него ломается tree shaking
function RadioGroupComponentInner(
    { disabled, onChange, options, value, className, ...rest }: RadioGroupProps,
    ref: React.ForwardedRef<ElementRef<typeof RadioGroupRadix.Root>>,
): React.ReactElement {
    const classNames = {
        root: clsx(s.root, className),
        item: s.item,
        indicator: s.indicator,
        label: s.label,
        optionWrapper: s.optionWrapper,
        icon: s.icon,
        iconWrapper: s.iconWrapper,
    }
    return (
      <RadioGroupRadix.Root
        {...rest}
        className={classNames.root}
        disabled={disabled}
        onValueChange={onChange}
        ref={ref}
        value={value}
      >
        {options.map((option) => (
          <div key={option.value} className={classNames.optionWrapper}>
            <RadioGroupRadix.Item className={classNames.item} id={`radio-${option.value}`} value={option.value}>
              <span className={classNames.iconWrapper}>
                <Icon className={classNames.icon} name="radio_button_unchecked" />
              </span>
              <RadioGroupRadix.Indicator className={classNames.indicator}>
                <Icon className={classNames.icon} name="radio_button_checked" />
              </RadioGroupRadix.Indicator>
            </RadioGroupRadix.Item>

            <label className={classNames.label} htmlFor={`radio-${option.value}`}>
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroupRadix.Root>
    )
}

export const RadioGroup = /* @__PURE__ */ forwardRef(RadioGroupComponentInner)