"use client"

import Link from "next/link"
import s from "./Logo.module.css"

export const Logo = () => {
  return (
    <Link className={s.logo} href="/">
      Inctagram
    </Link>
  )
}
