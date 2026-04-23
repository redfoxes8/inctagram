"use client"

import Image from "next/image"
import * as Select from "@radix-ui/react-select"
import { useId, type CSSProperties } from "react"
import s from "./SelectBox.module.css"
import { Props, SelectOption } from "./SelectBox.types"
import { Icon } from "@/shared/ui/Icon"

export const SelectBox = (props: Props) => {
  const { value, label, options, disabled, placeholder, onChange, width, height, ...rest } = props
  const selected = options.find((o) => o.value === value)
  const id = useId()

  const renderOptionVisual = (option?: SelectOption) => {
    if (!option) return null

    if (option.imageSrc) {
      return (
        <span className={s.iconLeft}>
          <Image src={option.imageSrc} alt="" width={20} height={20} className={s.imageIcon} aria-hidden="true" />
        </span>
      )
    }

    if (option.icon) {
      return (
        <span className={s.iconLeft}>
          <Icon name={option.icon} width={20} height={20} />
        </span>
      )
    }

    return null
  }

  return (
    <div className={s.wrapper}>
      {label && (
        <label htmlFor={id} className={s.label}>
          {label}
        </label>
      )}

      <Select.Root {...rest} value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger
          id={id}
          className={s.trigger}
          style={
            {
              "--select-width": width,
              "--select-height": height,
            } as CSSProperties
          }
          aria-label={label || placeholder || ""}
        >
          {renderOptionVisual(selected)}

          <Select.Value placeholder={placeholder} />

          <Select.Icon className={s.icon}>
            <Icon name="arrow-ios-Down-outline" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className={s.content} sideOffset={-1} position="popper">
            <Select.Viewport className={s.viewport}>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} className={s.item}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
