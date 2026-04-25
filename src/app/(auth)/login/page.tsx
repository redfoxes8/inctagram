import clsx from "clsx"
import Image from "next/image"
import { Input } from "@/shared/ui/Input"
import { Button } from "@/shared/ui/Button"
import { Icon } from "@/shared/ui/Icon"
import { Container } from "@/shared/ui/Container"

import s from "./login.module.css"

export default function SignIn() {
  return (
    <main className={s.wrapper}>
      <Container>
        <div className={s.content}>
          <span className="h2">Sign In</span>
          <div className={s.icon_group}>
            <Image
              src={"/icons/google-svgrepo-com.svg"}
              height={36}
              width={36}
              alt="google"
              style={{ cursor: "pointer" }}
            />
            <Icon name={"github-svgrepo-com (3) 1"} className={s.github_icon} />
          </div>

          <div className={s.input_group}>
            <Input label="Email" placeholder="Epam@epam.com" className={s.input_conf} />

            <div className={s.password_container}>
              <Input
                label="Password"
                placeholder="************"
                className={s.input_conf}
                rightIcon={<Icon name={"eye-outline"} />}
              />
              <span className={clsx("regular_text_14", s.forgot_password)}>Forgot Password</span>
            </div>
          </div>

          <div className={s.button_group}>
            <Button className={clsx(s.button_conf, "h3")}>Sign In</Button>
            <span className={clsx("regular_text_16", s.registration_prompt)}>Don’t have an account?</span>
            <Button variant="outlined" className={s.outlined_button_conf}>
              Sign Up
            </Button>
          </div>
        </div>
      </Container>
    </main>
  )
}
