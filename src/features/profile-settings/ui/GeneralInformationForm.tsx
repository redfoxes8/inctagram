"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"

import {
  getProfileSettingsQueryKey,
  SERVER_ERROR_MESSAGE,
  useProfileSettingsQuery,
  useUpdateProfileSettingsMutation,
} from "@/features/profile-settings/api/profile-settings-api"
import type { ProfileSettingsFormValues } from "@/features/profile-settings/types/type"
import type { SchemaUpdateProfileDto } from "@/shared/api/schema"
import { useCheckUsernameLazy } from "@/features/auth/api/use-check-username"
import { useMeQuery } from "@/features/auth/api/use-me"
import { Button, DateRangePicker, Input, TextArea } from "@/shared/ui"
import { Icon } from "@/shared/ui/Icon"

import {
  isDateOfBirthAllowed,
  isUnder13Error,
  isUnder13FieldError,
  NAME_PATTERN,
  toFormValues,
  toOptionalString,
  UNDER_13_FIELD_MESSAGE,
  UNDER_13_FORM_MESSAGE,
  USERNAME_PATTERN,
} from "@/features/profile-settings/lib/profile-settings-form.utils"

import s from "./ProfileSettings.module.css"

export const GeneralInformationForm = () => {
  const queryClient = useQueryClient()
  const { data: currentUser } = useMeQuery()
  const userId = currentUser?.userId
  const { data: profile, isLoading: isProfileLoading } = useProfileSettingsQuery(userId)
  const { mutateAsync: updateProfile, isPending: isUpdatePending } = useUpdateProfileSettingsMutation()
  const { mutateAsync: checkUsername, isPending: isUsernameChecking } = useCheckUsernameLazy()

  const {
    control,
    formState: { errors, isDirty, isValid },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<ProfileSettingsFormValues>({
    mode: "onBlur",
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      dateOfBirth: undefined,
      country: "",
      city: "",
      aboutMe: "",
    },
  })

  const initialUsername = profile?.username ?? ""

  useEffect(() => {
    if (profile) {
      reset(toFormValues(profile))
    }
  }, [profile, reset])

  const onSubmit = async (values: ProfileSettingsFormValues) => {
    const payload: SchemaUpdateProfileDto = {
      username: values.username.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      dateOfBirth: values.dateOfBirth ? format(values.dateOfBirth, "dd.MM.yyyy") : null,
      country: toOptionalString(values.country),
      city: toOptionalString(values.city),
      aboutMe: toOptionalString(values.aboutMe),
    }

    try {
      await updateProfile(payload)
      toast.success("Your settings are saved!")
      await queryClient.invalidateQueries({ queryKey: getProfileSettingsQueryKey(userId) })
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      reset({
        ...values,
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        dateOfBirth: values.dateOfBirth,
        country: payload.country ?? "",
        city: payload.city ?? "",
        aboutMe: payload.aboutMe ?? "",
      })
    } catch (error) {
      if (isUnder13Error(error)) {
        setError("dateOfBirth", {
          type: "server",
          message: UNDER_13_FIELD_MESSAGE,
        })
        return
      }

      toast.error(SERVER_ERROR_MESSAGE)
    }
  }

  const isSaveDisabled = !isValid || !isDirty || isProfileLoading || isUpdatePending || isUsernameChecking

  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={s.avatarColumn}>
        <div className={s.avatarPlaceholder}>
          <Icon name="image-outline" className={s.avatarIcon} />
        </div>

        <Button type="button" variant="outlined" className={s.photoButton}>
          Select Profile Photo
        </Button>
      </div>

      <div className={s.fieldsColumn}>
        <Input
          label="Username"
          className={s.fullField}
          disabled={isProfileLoading}
          error={errors.username?.message}
          required
          {...register("username", {
            required: "Username is required",
            minLength: { value: 6, message: "Username must be at least 6 characters" },
            maxLength: { value: 30, message: "Username must be at most 30 characters" },
            pattern: {
              value: USERNAME_PATTERN,
              message: "Username can contain only Latin letters, numbers, underscores and hyphens",
            },
            validate: async (value) => {
              const normalizedUsername = value.trim()

              if (!initialUsername || normalizedUsername === initialUsername) {
                return true
              }

              try {
                const result = await checkUsername(normalizedUsername)

                return result.available === true || "Username is already taken"
              } catch {
                return "Unable to check username availability"
              }
            },
          })}
        />

        <Input
          label="First Name"
          className={s.fullField}
          disabled={isProfileLoading}
          error={errors.firstName?.message}
          required
          {...register("firstName", {
            required: "First name is required",
            minLength: { value: 1, message: "First name must be at least 1 character" },
            maxLength: { value: 50, message: "First name must be at most 50 characters" },
            pattern: {
              value: NAME_PATTERN,
              message: "First name can contain only Latin and Cyrillic letters",
            },
          })}
        />

        <Input
          label="Last Name"
          className={s.fullField}
          disabled={isProfileLoading}
          error={errors.lastName?.message}
          required
          {...register("lastName", {
            required: "Last name is required",
            minLength: { value: 1, message: "Last name must be at least 1 character" },
            maxLength: { value: 50, message: "Last name must be at most 50 characters" },
            pattern: {
              value: NAME_PATTERN,
              message: "Last name can contain only Latin and Cyrillic letters",
            },
          })}
        />

        <Controller
          control={control}
          name="dateOfBirth"
          rules={{
            validate: (value) => isDateOfBirthAllowed(value) || UNDER_13_FORM_MESSAGE,
          }}
          render={({ field, fieldState }) => (
            <div className={s.dateOfBirthField}>
              <DateRangePicker
                mode="single"
                label="Date of birth"
                placeholder="00.00.0000"
                value={field.value}
                onChange={(date) => {
                  setValue("dateOfBirth", date, { shouldDirty: true, shouldValidate: true })
                }}
                disabled={isProfileLoading}
                error={isUnder13FieldError(fieldState.error?.message) ? undefined : fieldState.error?.message}
              />
              {isUnder13FieldError(fieldState.error?.message) && (
                <p className={s.linkedFieldError}>
                  A user under 13 cannot create a profile. <span className={s.fieldErrorLink}>Privacy Policy</span>
                </p>
              )}
            </div>
          )}
        />

        <div className={s.locationFields}>
          <Input
            label="Select your country"
            placeholder="Country"
            className={s.locationField}
            disabled={isProfileLoading}
            error={errors.country?.message}
            {...register("country")}
          />

          <Input
            label="Select your city"
            placeholder="City"
            className={s.locationField}
            disabled={isProfileLoading}
            error={errors.city?.message}
            {...register("city")}
          />
        </div>

        <TextArea
          label="About Me"
          placeholder="Text-area"
          className={s.fullField}
          rows={3}
          disabled={isProfileLoading}
          error={errors.aboutMe?.message}
          {...register("aboutMe", {
            maxLength: { value: 200, message: "About me must be at most 200 characters" },
          })}
        />
      </div>

      <div className={s.bottomDivider} />

      <Button type="submit" className={s.saveButton} disabled={isSaveDisabled}>
        Save Changes
      </Button>
    </form>
  )
}
