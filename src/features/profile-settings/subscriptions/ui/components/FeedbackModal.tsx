import { Modal, Button } from "@/shared/ui"
import s from "../Subscriptions.module.css"
import { FeedbackState } from "../../model/types"

type Props = { feedback: FeedbackState; onClose: () => void }

export const FeedbackModal = ({ feedback, onClose }: Props) => (
  <Modal
    isOpen={feedback !== null}
    onClose={onClose}
    title={feedback?.kind === "success" ? "Success" : "Error"}
    showFooter
    footer={
      <div className={s.feedbackFooter}>
        <Button type="button" onClick={onClose} className={s.feedbackBtn}>
          {feedback?.kind === "success" ? "OK" : "Back to payment"}
        </Button>
      </div>
    }
  >
    <p className="regular_text_16">{feedback?.text}</p>
  </Modal>
)
