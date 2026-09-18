import clsx from "clsx"
import { Checkbox } from "@/shared/ui"
import s from "../Subscriptions.module.css"

type Props = {
  checked: boolean
  disabled: boolean
  isError: boolean
  errorMessage?: string
  onChange: (value: boolean | "indeterminate") => void
}

export const AutoRenewToggle = ({ checked, disabled, isError, errorMessage, onChange }: Props) => (
  <section className={s.section}>
    <div className={s.autoRenewRow}>
      <Checkbox id="auto-renewal" checked={checked} disabled={disabled} onCheckedChange={onChange} />
      <label htmlFor="auto-renewal" className={clsx(s.autoRenewLabel, "regular_text_14")}>
        Auto-Renewal
      </label>
    </div>
    {isError && <p className={s.error}>{errorMessage || "Failed to update auto-renewal"}</p>}
  </section>
)
