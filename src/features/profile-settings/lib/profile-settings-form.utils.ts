import { startOfDay, subYears } from "date-fns"

import { ProfileSettingsApiError } from "@/features/profile-settings/api/profile-settings-api"
import type { ProfileSettingsFormValues } from "@/features/profile-settings/types/type"
import type { SchemaGetProfileResponseDto } from "@/shared/api/schema"

export const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/
export const NAME_PATTERN = /^[A-Za-zА-Яа-яЁё]+$/
export const UNDER_13_BACKEND_MESSAGE = "User must be at least 13 years old"
export const UNDER_13_FIELD_MESSAGE = "A user under 13 cannot create a profile. Privacy Policy"
export const UNDER_13_FORM_MESSAGE = "underThirteen"

type ApiErrorBody = {
  message: string
}

const isApiErrorBody = (value: unknown): value is ApiErrorBody => {
  if (!value || typeof value !== "object") {
    return false
  }
  return "message" in value && typeof value.message === "string"
}

export const isUnder13Error = (error: unknown): boolean => {
  return (
    error instanceof ProfileSettingsApiError &&
    error.status === 400 &&
    isApiErrorBody(error.body) &&
    error.body.message === UNDER_13_BACKEND_MESSAGE
  )
}

export const isDateOfBirthAllowed = (date: Date | undefined): boolean => {
  if (!date) return true

  const today = startOfDay(new Date())
  const minAllowedBirthDate = subYears(today, 13)

  return startOfDay(date) <= minAllowedBirthDate
}

export const isUnder13FieldError = (message: string | undefined) => {
  return message === UNDER_13_FORM_MESSAGE || message === UNDER_13_FIELD_MESSAGE
}

export const toOptionalString = (value: string | null | undefined): string | null => {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : null
}

export const toDateValue = (value: string | null | undefined): Date | undefined => {
  if (!value) return undefined

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date
}

export const toFormValues = (profile: SchemaGetProfileResponseDto): ProfileSettingsFormValues => ({
  username: profile.username,
  firstName: profile.firstName ?? "",
  lastName: profile.lastName ?? "",
  dateOfBirth: toDateValue(profile.dateOfBirth),
  country: profile.country ?? "",
  city: profile.city ?? "",
  aboutMe: profile.aboutMe ?? "",
})
