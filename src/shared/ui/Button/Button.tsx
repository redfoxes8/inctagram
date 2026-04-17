"use client"

import { Slot } from "@radix-ui/react-slot"
import s from "./Button.module.css"
import React, { ComponentProps } from "react"
import clsx from "clsx"

type ButtonVariant = "primary" | "secondary" | "outlined" | "ghost"

type Props = {
  children: React.ReactNode
  variant?: ButtonVariant
  className?: string
  asChild?: boolean
} & ComponentProps<"button">

export const Button = ({ children, variant = "primary", asChild = false, className = "", ...rest }: Props) => {
  const Component = asChild ? Slot : "button"
  const classes = clsx(s.button, s[variant], className)

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  )
}
