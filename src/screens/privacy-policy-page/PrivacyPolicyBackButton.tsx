"use client"

import { useRouter } from "next/navigation"

import { PAGES } from "@/shared/config/pages.config"
import { Icon } from "@/shared/ui/Icon"

import s from "./PrivacyPolicyPage.module.css"

export const PrivacyPolicyBackButton = () => {
  const router = useRouter()

  const handleBack = () => {
    window.close()

    window.setTimeout(() => {
      router.push(PAGES.SETTINGS("info"))
    }, 100)
  }

  return (
    <button type="button" className={s.backButton} onClick={handleBack}>
      <Icon name="arrow-back-outline" className={s.backIcon} />
      <span>Back to Profile Settings</span>
    </button>
  )
}
