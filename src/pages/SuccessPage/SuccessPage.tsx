import { Container } from "@/shared/ui/Container"
import s from "./SuccessPage.module.css"
import Image from "next/image"
import { Button } from "@/shared/ui/Button"
import clsx from "clsx"

interface Props {}

export function SuccessPage({}: Props) {
  return (
    <Container>
      <div className={s.content}>
        <span className={`h2`}>Congratulations</span>
        <span className={clsx(`regular_text_16`, s.confirmed)}>Your email has been confirmed</span>

        <Button className={s.button}>Sign In</Button>

        <Image className={s.bro_img} src={"/bro.png"} alt="bro" width={330} height={230} />
        <Button className={s.button_mobileOnly}>Sign In</Button>
      </div>
    </Container>
  )
}
