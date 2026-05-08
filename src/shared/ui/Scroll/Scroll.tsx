"use client"

import * as React from "react"
import s from "./Scroll.module.css"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import { ComponentPropsWithoutRef } from "react"
import clsx from "clsx"

type Props = {
  children: React.ReactNode
  className?: string
} & ComponentPropsWithoutRef<typeof ScrollArea.Root>

export const Scroll = ({ children, className = "", ...rest }: Props) => {
  const rootClasses = clsx(s.Root, className)

  return (
    <ScrollArea.Root className={rootClasses} {...rest}>
      <ScrollArea.Viewport className={s.Viewport}>{children}</ScrollArea.Viewport>

      <ScrollArea.Scrollbar className={s.Scrollbar} orientation="vertical">
        <ScrollArea.Thumb className={s.Thumb} />
      </ScrollArea.Scrollbar>

      <ScrollArea.Scrollbar className={s.Scrollbar} orientation="horizontal">
        <ScrollArea.Thumb className={s.Thumb} />
      </ScrollArea.Scrollbar>

      <ScrollArea.Corner className={s.Corner} />
    </ScrollArea.Root>
  )
}
