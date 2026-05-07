import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { RadioGroup } from "@/shared/ui/RadioGroup/RadioGroup"

const meta: Meta<typeof RadioGroup> = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
    value: { control: "text" },
    disabled: { control: "boolean" },
    options: { control: "object" },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Радио-группа на основе Radix UI с кастомной анимацией.

### Состояния, которые можно проверить через аддон Pseudo States:
- \`:hover\` — наведение на компонент
- \`:focus\` — фокусировка на компонент
- \`:active\` — зажатая кнопка мыши
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof RadioGroup>

const defaultOptions = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
]

// ========== Базовые истории ==========

export const Interactive: Story = {
  args: {
    options: defaultOptions,
  },
}

export const Default: Story = {
  args: {
    options: defaultOptions,
    value: "a",
  },
}

export const Disabled: Story = {
  args: {
    options: defaultOptions,
    disabled: true,
    value: "a",
  },
}

// ========== Истории с принудительными псевдоклассами ==========

export const Hovered: Story = {
  args: {
    options: defaultOptions,
    value: "a",
  },
  parameters: {
    pseudo: { hover: true }, // принудительно включаем :hover
  },
}

export const Focused: Story = {
  args: {
    options: defaultOptions,
    value: "a",
  },
  parameters: {
    pseudo: { focus: true }, // принудительно включаем :focus
  },
}

export const Active: Story = {
  args: {
    options: defaultOptions,
    value: "a",
  },
  parameters: {
    pseudo: { active: true }, // принудительно включаем :active
  },
}
