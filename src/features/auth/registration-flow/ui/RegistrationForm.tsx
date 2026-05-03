"use client"

import Image from "next/image"
import { Icon } from "@/shared/ui/Icon"
import { Input } from "@/shared/ui/Input"
import { Checkbox } from "@/shared/ui/Checkbox"
import { Button } from "@/shared/ui/Button"
import clsx from "clsx"
import { Controller, useForm } from "react-hook-form"

import s from "./RegistrationForm.module.css"
import Link from "next/link"
import { Modal } from "@/shared/ui/Modal"
import { useState } from "react"
import { useLazyCheckUsernameQuery, useRegistrationMutation } from "../../api/authApi"
import { useRouter } from "next/navigation"

type Props = {}

export function RegistrationForm({}: Props) {
  const [registration, { isLoading }] = useRegistrationMutation()
  const [triggerCheckUsername] = useLazyCheckUsernameQuery()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [emailValue, setEmailValue] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    control,
    reset,
  } = useForm({ mode: "onBlur" })
  const router = useRouter()

  const passwordValue = watch("password")
  watch(["username", "email", "password", "terms"])

  const onSubmit = async (data: any) => {
    try {
      await registration({
        username: data.username,
        email: data.email,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
      }).unwrap()

      setEmailValue(data.email)
      setIsOpen(true)
    } catch (err) {
      console.error("Registration error:", err)
    }
  }

  const handleClick = () => {
    setIsOpen(false)
    reset()
  }

  const isGroupValid = isValid

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className={s.container}>
        <div className={s.oauth_container}>
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
        </div>

        <div className={s.input_group}>
          <Input
            label="Username"
            placeholder="Epam"
            className={s.input_conf}
            error={errors.username?.message as string}
            {...register("username", {
              required: "Enter your username",
              minLength: { value: 6, message: "Minimum number of characters 6" },
              maxLength: { value: 30, message: "Maximum number of characters 30" },
              pattern: {
                value: /^[A-Za-z0-9_-]+$/,
                message: "You can only use letters, numbers, _ and -",
              },
              validate: async (value) => {
                if (value.length < 6) return true

                try {
                  const result = await triggerCheckUsername(value).unwrap()

                  return result.available || "This username is already taken"
                } catch (error) {
                  return "Server error"
                }
              },
            })}
          />

          <Input
            label="Email"
            placeholder="Epam@epam.com"
            className={s.input_conf}
            error={errors.email?.message as string}
            {...register("email", {
              required: "Enter your email",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format",
              },
            })}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="************"
            className={s.input_conf}
            rightIcon={
              <Icon
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                onClick={() => setShowPassword(!showPassword)}
              />
            }
            error={errors.password?.message as string}
            {...register("password", {
              required: "Enter your password",
              minLength: { value: 6, message: "Min length is 6" },
              maxLength: { value: 20, message: "Max length is 20" },
              validate: {
                hasNumber: (v) => /[0-9]/.test(v) || "Must contain at least one number",
                hasUpper: (v) => /[A-Z]/.test(v) || "Must contain at least one uppercase letter",
                hasLower: (v) => /[a-z]/.test(v) || "Must contain at least one lowercase letter",
                onlyAllowed: (v) =>
                  /^[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/.test(v) || "Contains forbidden characters",
              },
            })}
          />

          <Input
            label="Password confirmation"
            type={showPassword ? "text" : "password"}
            placeholder="************"
            className={s.input_conf}
            rightIcon={
              <Icon
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            error={errors.confirmPassword?.message as string}
            {...register("confirmPassword", {
              required: "Repeat password",
              validate: (value) => value === passwordValue || "Passwords must match",
            })}
          />
        </div>

        <div className={s.checkbox_place}>
          <Controller
            name="terms"
            control={control}
            rules={{ required: "You must agree" }}
            render={({ field }) => (
              <Checkbox
                id="terms"
                label={
                  <span className="small_text">
                    I agree to the{" "}
                    <Link href="" className="small_link">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="" className="small_link">
                      Privacy Policy
                    </Link>
                  </span>
                }
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className={s.button_group}>
          <Button className={clsx(s.button_conf, "h3")} disabled={!isGroupValid || isLoading}>
            {isLoading ? "Sending..." : "Sign Up"}
          </Button>
          <span className={"regular_text_16"}>Do you have an account?</span>
          <Button
            type="button"
            variant="outlined"
            className={s.outlined_button_conf}
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
        </div>
      </form>
      {isOpen && <Modal email={emailValue} onClose={handleClick} />}
    </>
  )
}
