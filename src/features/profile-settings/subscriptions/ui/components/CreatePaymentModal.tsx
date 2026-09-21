import clsx from "clsx"
import { Modal, Checkbox, Button } from "@/shared/ui"
import { PaymentProviderType } from "../../model/types"
import s from "../Subscriptions.module.css"

type Props = {
  isOpen: boolean
  isAgreed: boolean
  isCreatingSession: boolean
  provider: PaymentProviderType | null
  onClose: () => void
  onAgreeChange: (val: boolean) => void
  onConfirm: () => void
}

export const CreatePaymentModal = ({
  isOpen,
  isAgreed,
  isCreatingSession,
  provider,
  onClose,
  onAgreeChange,
  onConfirm,
}: Props) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Create payment"
    isCloseDisabled={isCreatingSession}
    showFooter
    contentClassName={s.custom_modal_content}
    footer={
      <div className={s.custom_footer}>
        <Checkbox
          id="terms-agreement"
          label={<span className="regular_text_16">I agree</span>}
          checked={isAgreed}
          onCheckedChange={(val) => onAgreeChange(!!val)}
          disabled={isCreatingSession}
        />
        <Button type="button" onClick={onConfirm} disabled={!isAgreed || isCreatingSession} className={s.confirm_btn}>
          {isCreatingSession ? "Loading..." : "OK"}
        </Button>
      </div>
    }
  >
    {provider === "PAYPAL" && (
      <p className={clsx("regular_text_16", s.modal_text, s.modalWarning)}>
        ⚠️ To enable auto-renewal via PayPal, you need a registered PayPal account with the appropriate auto-payment
        permission. Without it, the automatic renewal of your subscription will not work.
      </p>
    )}
    <p className={clsx("regular_text_16", s.modal_text)}>
      Auto-renewal will be enabled with this payment. You can disable it anytime in your profile settings.
    </p>
  </Modal>
)
