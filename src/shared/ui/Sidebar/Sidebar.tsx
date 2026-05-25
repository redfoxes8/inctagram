"use client"

import React, { ComponentPropsWithoutRef, useState } from "react"
import * as NavigationMenu from "@radix-ui/react-navigation-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import s from "./Sidebar.module.css"
import { Icon, type IconName } from "../Icon"

type SidebarItemState = "default" | "hover" | "focus" | "active" | "disabled"

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
  onCreateClick?: () => void
} & ComponentPropsWithoutRef<"aside">

export const Sidebar = ({ className = "", onLogout, onCreateClick, ...rest }: Props) => {
  const pathname = usePathname()

  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [focusedItem, setFocusedItem] = useState<string | null>(null)

  const mainNavItems: SidebarItem[] = [
    { id: "feed", href: "/", icon: "home-outline", iconSolid: "home", label: "Feed" },
    { id: "create", href: "#", icon: "plus-circle-outline", iconSolid: "plus-circle", label: "Create" },
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

  const getItemState = (item: SidebarItem): SidebarItemState => {
    if (item.disabled) return "disabled"
    if (item.id === "logout") return "default"
    if (isActive(item)) return "active"
    if (focusedItem === item.id) return "focus"
    if (hoveredItem === item.id) return "hover"
    return "default"
  }

  const getStateClassName = (state: SidebarItemState) => {
    switch (state) {
      case "active":
        return s.active

      case "focus":
        return s.focus

      case "hover":
        return s.hover

      case "disabled":
        return s.disabled

      case "default":
        return s.default

      default:
        return undefined
    }
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

    const navLinkClassName = clsx(s.navLink, getStateClassName(state))

    const commonProps = {
      className: navLinkClassName,
      "data-state": state,
      "data-id": item.id,
      onMouseEnter: () => setHoveredItem(item.id),
      onMouseLeave: () => setHoveredItem(null),
      onFocus: () => setFocusedItem(item.id),
      onBlur: () => setFocusedItem(null),
    }

    const isLogout = item.id === "logout"
    const isCreate = item.id === "create"

    if (isLogout || isCreate) {
      const handleClick = isLogout ? handleLogout : onCreateClick

      return (
        <NavigationMenu.Item key={item.id} className={s.navigationItem}>
          <button type="button" onClick={handleClick} disabled={item.disabled} aria-label={item.label} {...commonProps}>
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
          aria-disabled={item.disabled}
          aria-current={isItemActive ? "page" : undefined}
          tabIndex={item.disabled ? -1 : 0}
          {...commonProps}
        >
          <span className={s.icon}>
            <Icon name={iconName} />
          </span>
          <span className={s.label}>{item.label}</span>
        </Link>
      </NavigationMenu.Item>
    )
  }

  return (
    <aside className={clsx(s.sidebar, className)} {...rest}>
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
