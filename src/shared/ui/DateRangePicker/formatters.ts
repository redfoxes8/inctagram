import { format } from "date-fns"

export const getDisplayValue = (mode: string, value: any, placeholder: string): string => {
  if (mode === "single" && value instanceof Date) {
    return format(value, "dd/MM/yyyy")
  }
  if (mode === "range" && value?.from) {
    return value.to
      ? `${format(value.from, "dd/MM/yyyy")} - ${format(value.to, "dd/MM/yyyy")}`
      : `${format(value.from, "dd/MM/yyyy")} - `
  }
  if (mode === "multiple" && Array.isArray(value) && value.length > 0) {
    return value.length === 1 ? format(value[0], "dd/MM/yyyy") : `${value.length} days selected`
  }
  return placeholder
}
