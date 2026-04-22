import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Recaptcha } from "./Recaptcha"

const meta = {
  title: "Components/Recaptcha",
  component: Recaptcha,
  argTypes: {
    status: {
      control: "select",
      options: ["default", "loading", "error", "checked", "expired"],
    },
  },
} satisfies Meta<typeof Recaptcha>

export default meta
type Story = StoryObj<typeof Recaptcha>

export const Default: Story = {
  args: {
    status: "default",
  },
}

export const Loading: Story = {
  args: {
    status: "loading",
  },
}

export const Checked: Story = {
  args: {
    status: "checked",
  },
}

export const ErrorState: Story = {
  args: {
    status: "error",
    errorMessage: "Please verify that you are not a robot",
  },
}

export const Expired: Story = {
  args: {
    status: "expired",
  },
}
