import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { TextArea } from "./TextArea"

const meta = {
  title: "Components/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Кастомный компонент текстовой области",
      },
    },
  },
} satisfies Meta<typeof TextArea>

export default meta
type Story = StoryObj<typeof TextArea>

export const Default: Story = {
  args: {
    label: "Text-area",
    placeholder: "Tell your story...",
  },
}

export const Active: Story = {
  args: {
    label: "Text-area",
    placeholder: "Tell your story...",
    autoFocus: true,
  },
}

export const WithError: Story = {
  args: {
    label: "Text-area",
    placeholder: "Tell your story...",
    error: "Error text",
  },
}

export const Disabled: Story = {
  args: {
    label: "Text-area",
    placeholder: "Tell your story...",
    disabled: true,
  },
}
