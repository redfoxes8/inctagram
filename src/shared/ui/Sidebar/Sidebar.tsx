"use client"

import React, { useState } from "react"
import * as NavigationMenu from "@radix-ui/react-navigation-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import s from "./Sidebar.module.css"
import { Icon, IconName } from "../Icon"

type SidebarItem = {
  id: string
  label: string
  icon: IconName
  iconSolid: IconName
  href: string
  disabled?: boolean
}

type Props = {
  className?: string
  onLogout?: () => void
}

export const Sidebar = ({ className = "", onLogout }: Props) => {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [focusedItem, setFocusedItem] = useState<string | null>(null)

  const mainNavItems: SidebarItem[] = [
    { id: "feed", href: "/", icon: "home-outline", iconSolid: "home", label: "Feed" },
    { id: "create", href: "/create", icon: "plus-circle-outline", iconSolid: "plus-circle", label: "Create" },
    { id: "profile", href: "/profile", icon: "person-outline", iconSolid: "person", label: "My Profile" },
    {
      id: "messenger",
      href: "/messenger",
      icon: "message-circle-outline",
      iconSolid: "message-circle",
      label: "Messenger",
    },
    { id: "search", href: "/search", icon: "search-outline", iconSolid: "search", label: "Search" },
  ]

  const secondaryNavItems: SidebarItem[] = [
    {
      id: "statistics",
      href: "/statistics",
      icon: "trending-up-outline",
      iconSolid: "trending-up",
      label: "Statistics",
    },
    { id: "favorites", href: "/favorites", icon: "bookmark-outline", iconSolid: "bookmark", label: "Favorites" },
  ]

  const logoutItem: SidebarItem = {
    id: "logout",
    href: "/login",
    icon: "log-out-outline",
    iconSolid: "log-out",
    label: "Log Out",
  }

  const isActive = (item: SidebarItem) => {
    if (item.id === "logout" || item.disabled) return false
    if (item.href === "/") {
      return pathname === item.href
    }
    return pathname?.startsWith(`${item.href}/`) || pathname === item.href
  }

  const getItemState = (item: SidebarItem) => {
    if (item.disabled) return "disabled"
    if (item.id === "logout") return "default"
    if (isActive(item)) return "active"
    if (focusedItem === item.id) return "focus"
    if (hoveredItem === item.id) return "hover"
    return "default"
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    console.log("Logging out...")
  }

  const renderNavItem = (item: SidebarItem) => {
    const state = getItemState(item)
    const isItemActive = state === "active"
    const iconName = isItemActive ? item.iconSolid : item.icon
    const isLogout = item.id === "logout"

    if (isLogout) {
      return (
        <NavigationMenu.Item key={item.id} className={s.navigationItem}>
          <button
            onClick={handleLogout}
            className={clsx(s.navLink, s[state])}
            data-state={state}
            data-id={item.id}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onFocus={() => setFocusedItem(item.id)}
            onBlur={() => setFocusedItem(null)}
            disabled={item.disabled}
            aria-label={item.label}
          >
            <span className={s.icon}>
              <Icon name={iconName} />
            </span>
            <span className={s.label}>{item.label}</span>
          </button>
        </NavigationMenu.Item>
      )
    }

    return (
      <NavigationMenu.Item key={item.id} className={s.navigationItem}>
        <Link
          href={item.disabled ? "#" : item.href}
          prefetch={!item.disabled}
          className={clsx(s.navLink, s[state])}
          data-state={state}
          data-id={item.id}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          onFocus={() => setFocusedItem(item.id)}
          onBlur={() => setFocusedItem(null)}
          aria-disabled={item.disabled}
          aria-current={isItemActive ? "page" : undefined}
          tabIndex={item.disabled ? -1 : 0}
        >
          <span className={s.icon}>
            <Icon name={iconName} />
          </span>
          <span
            className={clsx(s.label, {
              [s.labelActive]: isItemActive,
            })}
          >
            {item.label}
          </span>
        </Link>
      </NavigationMenu.Item>
    )
  }

  return (
    <aside className={clsx(s.sidebar, className)}>
      <NavigationMenu.Root className={s.navigationRoot}>
        <NavigationMenu.List className={s.navigationList}>
          <div className={s.mainNavGroup}>{mainNavItems.map(renderNavItem)}</div>
          <div className={s.secondaryNavGroup}>{secondaryNavItems.map(renderNavItem)}</div>
          <div className={s.logoutGroup}>{renderNavItem(logoutItem)}</div>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </aside>
  )
}
