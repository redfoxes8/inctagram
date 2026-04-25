"use client"

import React from "react"
import * as Label from "@radix-ui/react-label"
import clsx from "clsx"
import s from "./TextArea.module.css"

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export const TextArea = ({ label, error, disabled, id, className, rows = 4, ...props }: TextAreaProps) => {
  const textareaId = id || label?.toLowerCase().replace(/\s/g, "-")

  return (
    <div className={clsx(s.container, { [s.disabledContainer]: disabled }, className)}>
      {label && (
        <Label.Root htmlFor={textareaId} className={s.label}>
          {label}
        </Label.Root>
      )}
      <div className={clsx(s.textareaWrapper, { [s.error]: error, [s.disabled]: disabled })}>
        <textarea
          id={textareaId}
          className={s.textarea}
          disabled={disabled}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <div id={`${textareaId}-error`} className={s.errorMessage}>
          {error}
        </div>
      )}
    </div>
  )
}
