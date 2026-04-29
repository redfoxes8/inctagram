"use client"
import { Icon } from "@/shared/ui/Icon"
import styles from "./page.module.css"
import Image from "next/image"
import { Checkbox } from "@/shared/ui/Checkbox"
import { Button } from "@/shared/ui/Button"
import { Input } from "@/shared/ui/Input"
import { Recaptcha, RecaptchaStatus } from "@/shared/ui/Recaptcha"
import { Tabs } from "@/shared/ui/Tabs"
import { TextArea } from "@/shared/ui/TextArea"
import { useState } from "react"
import { SelectOption } from "@/shared/ui/SelectBox/SelectBox.types"
import { SelectBox } from "@/shared/ui/SelectBox"
import { RadioGroup } from "@/shared/ui/RadioGroup"

const mockFetch = () => {
  return new Promise((resolve, reject) => {
    console.log("Запрос отправлен...")

    setTimeout(() => {
      const isSuccess = Math.random() > 0.5

      if (isSuccess) {
        resolve({ status: 200, data: "Успешные данные" })
      } else {
        reject({ status: 500, message: "Ошибка сервера" })
      }
    }, 1000)
  })
}

export default function Home() {
  const [selectValue, setSelectValue] = useState("1")

  const options: SelectOption[] = [
    { value: "1", label: "Option 1", icon: "search-outline" },
    { value: "2", label: "Option 2", icon: "settings-outline" },
    { value: "3", label: "Option 3", icon: "person-outline" },
    { value: "4", label: "Option 4", icon: "home" },
  ]

  const [recaptchaStatus, setRecaptchaStatus] = useState<RecaptchaStatus>("default")

  const handleChange = async () => {
    if (recaptchaStatus === "loading" || recaptchaStatus === "checked") return

    setRecaptchaStatus("loading")

    try {
      await mockFetch()
      setRecaptchaStatus("checked")

      setTimeout(() => {
        setRecaptchaStatus("expired")
      }, 120000)
    } catch (err) {
      setRecaptchaStatus("error")
    }
  }
  console.log("Component Render", recaptchaStatus)

  return (
    <div className={styles.container}>
      <h1 className="h1">h1</h1>
      <p className="large">large</p>
      <p className="regular_text_16">regular_text_16</p>
      <p className={`medium_text_14 ${styles.mediumText}`}>medium_text_14 with accent 500</p>
      <a className="regular_link">Regular-Link</a>
      {/* Ниже указан вариант работы с 83 иконками, включая иконку github, каждый SVG файл был модифицирован,
      теперь мы можем менять цвет иконок, решил сделать такой вариант, чтобы не засорять public огромным кол-ом svg иконок
      (там их 83 ч/б), самописный компонент Icon сами его посмотрите в shared/ui/Icon.tsx ничего сложного нет, 
      создал UnionType чтобы никто не ошибся случайно (могут быть баги) Доработки и фиксы приветствуются*/}
      <Icon name="Outline bell" style={{ color: "red" }} />
      {/* Классический компонент next - Image, который принимает /icons/...svg эти картинки имеют цвет,
      поэтому они не попали в sprite с ними работаем в обычном формате, 
      можно конечно на каждую создать отдельный компонент в shared/ui/Icons/... но не вижу в этом смысла(пока что),
      но если кому нечем будет заняться пожалуйста создавайте таску в Jira через PM и делайте */}
      <Image src="/icons/facebook-svgrepo-com.svg" alt="Russian" width={24} height={16} />
      <Checkbox id={"1"} />
      <RadioGroup
        options={[
          { label: "2", value: "2" },
          { label: "3", value: "3" },
        ]}
      />
      {/*Если эта страница или компонент должны быть интерактивными, добавь сверху: "use client" потом нужно будет убрать*/}
      <Button variant={"primary"} type={"button"} onClick={() => console.log("click")}>
        Click
      </Button>
      {/* Active */}
      <div>
        <Input
          label="Email"
          placeholder="example@mail.com"
          autoFocus
          rightIcon={<Icon name="eye-outline" />}
          onRightIconClick={() => console.log("клик по глазу")}
        />
      </div>
      {/* Error */}
      <Input
        label="Email"
        error="Error text"
        rightIcon={<Icon name="eye-outline" />}
        onRightIconClick={() => console.log("клик по глазу")}
      />
      {/* Disabled */}
      <div>
        <p style={{ color: "#ccc", marginBottom: "0.5rem" }}>Disabled</p>
        <Input label="Email" disabled rightIcon={<Icon name="eye-outline" />} />
      </div>
      {/* Пример с иконкой поиска (Search Bar) */}
      <div>
        <Input label="Поиск" leftIcon={<Icon name="search-outline" />} placeholder="Input search" />
      </div>
      <Recaptcha status={recaptchaStatus} onCheckedChange={handleChange} />
      {/*Tabs*/}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "2rem" }}>
        <div>
          <p style={{ color: "#666", marginBottom: "0.5rem" }}></p>
          <Tabs defaultValue="tab" items={[{ label: "Tabs", value: "tab" }]} />
        </div>
        <div>
          <p style={{ color: "#ccc", marginBottom: "0.5rem" }}>Disabled</p>
          <Tabs items={[{ label: "Tabs", value: "tab", disabled: true }]} />
        </div>
      </div>
      {/* Text-area */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div>
          <TextArea label="Text-area" placeholder="Tell your story..." autoFocus />
        </div>
        <div>
          <TextArea label="Text-area" error="Error text" placeholder="Tell your story..." />
        </div>
        <div>
          <p style={{ color: "#ccc", marginBottom: "0.5rem" }}>Disabled</p>
          <TextArea label="Text-area" disabled placeholder="Tell your story..." />
        </div>
      </div>
      {/* SelectBox */}
      <SelectBox
        label="Select"
        value={selectValue}
        onChange={setSelectValue}
        options={options}
        placeholder="Choose option"
      />
    </div>
  )
}
