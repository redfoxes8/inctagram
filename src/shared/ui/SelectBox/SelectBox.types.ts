import { Root } from "@radix-ui/react-select"
import { ComponentPropsWithoutRef } from "react"
import { IconName } from "@/shared/ui/Icon"

type RadixRootProps = ComponentPropsWithoutRef<typeof Root> // Получаем ВСЕ пропсы Radix Select.Root

export type SelectOption = {
  value: string
  label: string
  icon?: IconName
  imageSrc?: string
}

export type Props = Omit<RadixRootProps, "onValueChange"> & {
  label?: string
  options: SelectOption[]
  placeholder?: string
  onChange: (value: string) => void
  width?: string
  height?: string
}
