import clsx from "clsx"
import { RadioGroup } from "@/shared/ui"
import s from "../Subscriptions.module.css"

type Props = {
  title: string
  options: { label: string; value: string }[]
  value: string
  isLoading: boolean
  isError: boolean
  onChange: (val: string) => void
}

export const SubscriptionPlanSelector = ({ title, options, value, isLoading, isError, onChange }: Props) => (
  <>
    <h3 className={clsx("h3", s.sectionTitle)}>{title}</h3>
    <div className={s.account_type}>
      {isLoading ? (
        <span className="regular_text_16">Loading subscriptions...</span>
      ) : isError ? (
        <span className="regular_text_16">Failed to load subscription plans. Please refresh the page.</span>
      ) : options.length === 0 ? (
        <span className="regular_text_16">No subscription plans available at the moment. Please try again later.</span>
      ) : (
        <RadioGroup options={options} value={value} onChange={onChange} />
      )}
    </div>
  </>
)
