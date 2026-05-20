"use client"

import { GoogleReCaptcha, GoogleReCaptchaProvider } from "react-google-recaptcha-v3"

type RecaptchaProps = {
  onVerify: (token: string) => void
}

export const Recaptcha = ({ onVerify }: RecaptchaProps) => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  if (!siteKey) {
    return null
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey} scriptProps={{ async: true, defer: true, appendTo: "head" }}>
      <GoogleReCaptcha
        onVerify={(token) => {
          if (token && typeof onVerify === "function") {
            onVerify(token)
          }
        }}
      />
    </GoogleReCaptchaProvider>
  )
}
