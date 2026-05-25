import { Icon } from "../Icon"
import s from "./Modal.module.css"
import { Button } from "@/shared/ui/Button"

type ModalProps = {
  email?: string
  onClose: () => void
}

export const Modal = ({ email, onClose }: ModalProps) => {
  return (
    <dialog open className={s.dialog}>
      <div className={s.header}>
        <span style={{ fontWeight: 700 }}>Email sent</span>
        <Icon name="close-outline" onClick={onClose} style={{ cursor: "pointer" }} />
      </div>

      <div className={s.content}>
        <p style={{ fontSize: "14px" }}>
          We have sent a link to confirm your email to <br />
          <b style={{ color: "#fff" }}>{email}</b>
        </p>

        <Button onClick={onClose}>OK</Button>
      </div>
    </dialog>
  )
}
