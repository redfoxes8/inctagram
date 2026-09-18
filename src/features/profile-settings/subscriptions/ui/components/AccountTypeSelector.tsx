import clsx from "clsx"
import { RadioGroup } from "@/shared/ui"
import s from "../Subscriptions.module.css"

const ACCOUNT_OPTIONS = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
]

type Props = { value: string; onChange: (val: string) => void }

export const AccountTypeSelector = ({ value, onChange }: Props) => (
  <section className={s.section}>
    <h3 className={clsx(s.sectionTitle, "h3")}>Account type:</h3>
    <div className={s.account_type}>
      <RadioGroup options={ACCOUNT_OPTIONS} value={value} onChange={onChange} />
    </div>
  </section>
)
