import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "./Input"
import { Icon } from "../Icon"

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Кастомный компонент ввода",
      },
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    label: "Email",
    placeholder: "example@mail.com",
  },
}

export const Active: Story = {
  args: {
    label: "Email",
    placeholder: "example@mail.com",
    autoFocus: true,
    rightIcon: <Icon name="eye-outline" />,
  },
}

export const WithError: Story = {
  args: {
    label: "Email",
    placeholder: "example@mail.com",
    error: "Error text",
    rightIcon: <Icon name="eye-outline" />,
  },
}

export const Disabled: Story = {
  args: {
    label: "Email",
    placeholder: "example@mail.com",
    disabled: true,
    rightIcon: <Icon name="eye-outline" />,
  },
}

export const Search: Story = {
  args: {
    label: "Поиск",
    placeholder: "Input search",
    leftIcon: <Icon name="search-outline" />,
  },
}
