"use client"

import React from "react"
import * as Label from "@radix-ui/react-label"
import clsx from "clsx"
import s from "./Input.module.css"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
  onLeftIconClick?: () => void
}

export const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconClick,
  onLeftIconClick,
  disabled,
  id,
  className,
  ...props
}: InputProps) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, "-")

  return (
    <div className={clsx(s.container, { [s.disabledContainer]: disabled }, className)}>
      {label && (
        <Label.Root htmlFor={inputId} className={s.label}>
          {label}
        </Label.Root>
      )}
      <div className={clsx(s.inputWrapper, { [s.error]: error, [s.disabled]: disabled })}>
        {leftIcon && (
          <button
            type="button"
            className={s.iconLeft}
            onClick={onLeftIconClick}
            disabled={disabled}
            aria-label="search"
          >
            {leftIcon}
          </button>
        )}
        <input
          id={inputId}
          className={s.input}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            className={s.iconRight}
            onClick={onRightIconClick}
            disabled={disabled}
            aria-label="Show password"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && (
        <div id={`${inputId}-error`} className={s.errorMessage}>
          {error}
        </div>
      )}
    </div>
  )
}
