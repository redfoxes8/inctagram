"use client"
import { Icon } from "@/shared/ui/Icon"
import styles from "./page.module.css"
import Image from "next/image"
import { Checkbox } from "@/shared/ui/Checkbox"
import { Button } from "@/shared/ui/Button"
import { Input } from "@/shared/ui/Input"
import { Tabs } from "@/shared/ui/Tabs"

export default function Home() {
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
      {/*Tabs*/}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "2rem" }}>
        <div>
          <p style={{ color: "#666", marginBottom: "0.5rem" }}></p>
          <Tabs defaultValue="tab1" items={[{ label: "Tabs", value: "tab" }]} />
        </div>
        <div>
          <p style={{ color: "#ccc", marginBottom: "0.5rem" }}>Disabled</p>
          <Tabs items={[{ label: "Tabs", value: "tab", disabled: true }]} />
        </div>
      </div>
      {/**/}
    </div>
  )
}
