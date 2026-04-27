"use client"

import { useState } from "react"
import { SelectBox } from "@/shared/ui/SelectBox"
import s from "./LanguageSwitcher.module.css"

const languageOptions = [
  {
    value: "en",
    label: "English",
    imageSrc: "/icons/flagUnitedKingdom.svg",
  },
  {
    value: "ru",
    label: "Русский",
    imageSrc: "/icons/flagRussia.svg",
  },
] as const

export const LanguageSwitcher = () => {
  const [language, setLanguage] = useState<string>("ru")

  return (
    <SelectBox
      value={language}
      onChange={setLanguage}
      options={[...languageOptions]}
      className={s.root}
      triggerClassName={s.trigger}
      iconClassName={s.icon}
      optionVisualClassName={s.optionVisual}
      imageClassName={s.image}
      renderValue={() => null}
      aria-label="Select language"
    />
  )
}
