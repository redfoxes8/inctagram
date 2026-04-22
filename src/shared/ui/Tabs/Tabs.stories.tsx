import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Tabs } from "./Tabs"

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  args: {
    defaultValue: "tab",
    items: [{ label: "Tabs", value: "tab" }],
  },
}

export const Disabled: Story = {
  args: {
    items: [{ label: "Tabs", value: "tab", disabled: true }],
  },
}

export const Active: Story = {
  args: {
    value: "tab",
    items: [{ label: "Tabs", value: "tab" }],
  },
}
