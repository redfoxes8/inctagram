import clsx from "clsx"
import { ReactNode } from "react"
import styles from "./Container.module.css"

export const Container = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={clsx(styles.container, className)}>{children}</div>
}
