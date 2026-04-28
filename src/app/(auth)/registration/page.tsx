import clsx from "clsx"
import Image from "next/image"
import { Input } from "@/shared/ui/Input"
import { Button } from "@/shared/ui/Button"
import { Icon } from "@/shared/ui/Icon"
import { Container } from "@/shared/ui/Container"

import s from "./registration.module.css"
import { Checkbox } from "@/shared/ui/Checkbox"

export default function SignIn() {
  return (
    <main className={s.wrapper}>
      <Container>
        <div className={s.content}>
          <span className="h2">Sign Up</span>
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
            <Input label="Username" placeholder="Epam" className={s.input_conf} />

            <Input label="Email" placeholder="Epam@epam.com" className={s.input_conf} />

            <Input
              label="Password"
              placeholder="************"
              className={s.input_conf}
              rightIcon={<Icon name={"eye-off-outline"} />}
            />

            <Input
              label="Password confirmation"
              placeholder="************"
              className={s.input_conf}
              rightIcon={<Icon name={"eye-off-outline"} />}
            />
          </div>

          <div className={s.checkbox_place}>
            <Checkbox
              id="id"
              label={
                <span className="small_text">
                  I agree to the{" "}
                  <a href="" className="small_link">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="" className="small_link">
                    Privacy Policy
                  </a>
                </span>
              }
            />
          </div>

          <div className={s.button_group}>
            <Button className={clsx(s.button_conf, "h3")}>Sign Up</Button>
            <span className={clsx("regular_text_16", s.registration_prompt)}>Do you have an account?</span>
            <Button variant="outlined" className={s.outlined_button_conf}>
              Sign In
            </Button>
          </div>
        </div>
      </Container>
    </main>
  )
}
