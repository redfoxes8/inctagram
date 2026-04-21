"use client"

import React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import clsx from "clsx"
import s from "./Tabs.module.css"

export type TabsItem = {
  value: string
  label: string
  disabled?: boolean
}

export type TabsProps = {
  items: TabsItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  className?: string
  children?: React.ReactNode
}

export const Tabs = ({
  items,
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  className,
  children,
}: TabsProps) => {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      className={clsx(s.root, className)}
    >
      <TabsPrimitive.List className={s.list}>
        {items.map((item) => (
          <TabsPrimitive.Trigger key={item.value} value={item.value} disabled={item.disabled} className={s.trigger}>
            {item.label}
            <span className={s.indicator} />
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  )
}

export const TabPanel = TabsPrimitive.Content
