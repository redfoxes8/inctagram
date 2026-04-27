import clsx from "clsx"

import s from "./FlexWrapper.module.css"

type FlexWrapperProps = {
  children: React.ReactNode
  direction?: "row" | "column"
  justify?: "flex-start" | "center" | "flex-end" | "space-between"
  align?: "stretch" | "flex-start" | "center" | "flex-end"
  wrap?: "nowrap" | "wrap"
  className?: string
}

export const FlexWrapper = ({
  children,
  direction = "row",
  justify = "flex-start",
  align = "stretch",
  wrap = "nowrap",
  className,
}: FlexWrapperProps) => {
  return (
    <div
      className={clsx(
        s.flex,
        s[`direction-${direction}`],
        s[`justify-${justify}`],
        s[`align-${align}`],
        s[`wrap-${wrap}`],
        className,
      )}
    >
      {children}
    </div>
  )
}
