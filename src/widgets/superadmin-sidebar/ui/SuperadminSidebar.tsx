import Link from "next/link"
import { Icon, type IconName } from "@/shared/ui/Icon"
import s from "./SuperadminSidebar.module.css"

type NavigationItem = {
  label: string
  icon: IconName
  // Маршрут проложен только по существующим участкам; недоступные элементы остаются неинтерактивными.
  href?: string
}

const navigation: NavigationItem[] = [
  { label: "Users list", icon: "person", href: "/superadmin/users" },
  { label: "Statistics", icon: "trending-up" },
  { label: "Payments list", icon: "credit-card-outline" },
  { label: "Posts list", icon: "image-outline" },
]

export function SuperadminSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className={s.sidebar}>
      <nav aria-label="Superadmin navigation">
        {navigation.map((item) => {
          if (!item.href) {
            return (
              <span key={item.label} className={s.navItem} aria-disabled="true" title="Page not available yet">
                <Icon name={item.icon} />
                {item.label}
              </span>
            )
          }

          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.label}
              className={s.navLink}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              prefetch={false}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
