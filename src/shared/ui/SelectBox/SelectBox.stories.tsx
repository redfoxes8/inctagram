import { SelectBox } from "./SelectBox"
import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/SelectBox",
  component: SelectBox,
  tags: ["autodocs"],
  args: {
    label: "Difficulty status",
    placeholder: "Select...",
    disabled: false,
    value: "easy",
    options: [
      { label: "Easy", value: "easy" },
      { label: "Medium", value: "medium" },
      { label: "Hard", value: "hard" },
      { label: "Expert", value: "expert" },
    ],
    onChange: (val: string) => console.log("Changed:", val),
  },
} satisfies Meta<typeof SelectBox>

export default meta
type Story = StoryObj<typeof SelectBox>

const StatefulTemplate = (args: React.ComponentProps<typeof SelectBox>) => {
  const [value, setValue] = useState(args.value ?? "")

  return (
    <SelectBox
      {...args}
      value={value}
      onChange={(v: string) => {
        setValue(v)
      }}
    />
  )
}

export const Default: Story = {
  render: StatefulTemplate,
}

export const WithIcon: Story = {
  render: StatefulTemplate,
  args: {
    label: "Language",
    value: "ru",
    options: [
      {
        label: "Russian",
        value: "ru",
        imageSrc: "/icons/flagRussia.svg",
      },
      {
        label: "English",
        value: "en",
        imageSrc: "/icons/flagUnitedKingdom.svg",
      },
    ],
  },
}

export const Disabled: Story = {
  render: StatefulTemplate,
  args: {
    disabled: true,
  },
}

export const Preselected: Story = {
  render: StatefulTemplate,
  args: {
    value: "hard",
  },
}

export const CustomStyles: Story = {
  render: StatefulTemplate,
  args: {
    width: "350px",
    height: "50px",
  },
}

export const ManyOptions: Story = {
  render: StatefulTemplate,
  args: {
    value: "",
    label: "Car",
    placeholder: "Select...",
    options: [
      { label: "BMW", value: "bmw" },
      { label: "Audi", value: "audi" },
      { label: "Tesla", value: "tesla" },
      { label: "Toyota", value: "toyota" },
      { label: "Mercedes-Benz", value: "mercedes" },
      { label: "Volkswagen", value: "vw" },
      { label: "Ford", value: "ford" },
      { label: "Chevrolet", value: "chevrolet" },
      { label: "Honda", value: "honda" },
      { label: "Hyundai", value: "hyundai" },
    ],
  },
}
