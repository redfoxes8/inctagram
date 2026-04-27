"use client"

import Image from "next/image"
import * as Select from "@radix-ui/react-select"
import { useId, type CSSProperties } from "react"
import clsx from "clsx"
import s from "./SelectBox.module.css"
import { Props, SelectOption } from "./SelectBox.types"
import { Icon } from "@/shared/ui/Icon"

export const SelectBox = (props: Props) => {
  const {
    value,
    label,
    options,
    disabled,
    placeholder,
    onChange,
    width,
    height,
    className,
    triggerClassName,
    iconClassName,
    optionVisualClassName,
    imageClassName,
    renderValue,
    ...rest
  } = props
  const selected = options.find((o) => o.value === value)
  const id = useId()

  const renderOptionVisual = (option?: SelectOption) => {
    if (!option) return null

    if (option.imageSrc) {
      return (
        <span className={clsx(s.iconLeft, optionVisualClassName)}>
          <Image
            src={option.imageSrc}
            alt=""
            width={20}
            height={20}
            className={clsx(s.imageIcon, imageClassName)}
            aria-hidden="true"
          />
        </span>
      )
    }

    if (option.icon) {
      return (
        <span className={clsx(s.iconLeft, optionVisualClassName)}>
          <Icon name={option.icon} width={20} height={20} />
        </span>
      )
    }

    return null
  }

  return (
    <div className={clsx(s.wrapper, className)}>
      {label && (
        <label htmlFor={id} className={s.label}>
          {label}
        </label>
      )}

      <Select.Root {...rest} value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger
          id={id}
          className={clsx(s.trigger, triggerClassName)}
          style={
            {
              "--select-width": width,
              "--select-height": height,
            } as CSSProperties
          }
          aria-label={label || placeholder || ""}
        >
          {renderOptionVisual(selected)}

          {renderValue ? renderValue(selected) : <Select.Value placeholder={placeholder} />}

          <Select.Icon className={clsx(s.icon, iconClassName)}>
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
