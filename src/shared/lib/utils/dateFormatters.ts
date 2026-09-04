import { formatDistanceToNow } from "date-fns"

export const formatCommentDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return "Invalid date"
  }
}

export const formatPostDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return "Invalid date"
  }
}

export const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}
