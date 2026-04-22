"use client"

import Image from "next/image"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import s from "./Recaptcha.module.css"
import clsx from "clsx"
import { Icon } from "../Icon"

export type RecaptchaStatus = "default" | "loading" | "error" | "checked" | "expired"

type RecaptchaProps = {
  status?: RecaptchaStatus
  errorMessage?: string
  onCheckedChange?: (checked: boolean) => void
}

export const Recaptcha = ({
  status = "default",
  errorMessage = "Please verify that you are not a robot",
  onCheckedChange,
}: RecaptchaProps) => {
  const isError = status === "error"
  const isExpired = status === "expired"
  const isLoading = status === "loading"
  const isChecked = status === "checked"

  return (
    <div className={clsx(s.wrapper, isError && s.errorWrapper)}>
      {isExpired && <span className={s.expiredTopText}>Verification expired. Check the checkbox again.</span>}

      <div className={s.container}>
        <div className={s.leftSection}>
          <div className={s.checkboxWrapper}>
            {isLoading ? (
              <div className={s.spinner} />
            ) : (
              <CheckboxPrimitive.Root
                className={s.checkboxRoot}
                id="recaptcha"
                checked={isChecked}
                onCheckedChange={onCheckedChange}
              >
                <CheckboxPrimitive.Indicator className={s.checkboxIndicator}>
                  <Icon name={"checkmark-outline"} color={"#19983BE6"} />
                </CheckboxPrimitive.Indicator>
              </CheckboxPrimitive.Root>
            )}
          </div>

          <label className={s.label} htmlFor="recaptcha">
            {"I'm not a robot"}
          </label>
        </div>

        <div className={s.googleSection}>
          <Image src="/icons/RecaptchaLogo.svg" alt="recaptcha" width={40} height={40} className={s.logo} />
          <div className={s.policy}>Privacy - Terms</div>
        </div>
      </div>

      {isError && <span className={s.errorText}>{errorMessage}</span>}
    </div>
  )
}
