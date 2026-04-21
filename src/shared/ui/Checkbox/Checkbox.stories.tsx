import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Checkbox } from "./Checkbox"

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof Checkbox>

export const Interactive: Story = {
  args: {
    id: "checkbox-interactive",
    checked: false,
  },
  render: (args) => {
    const [isChecked, setIsChecked] = useState<boolean>(args.checked ?? false)

    return (
      <Checkbox
        {...args}
        checked={isChecked}
        onCheckedChange={(val) => {
          setIsChecked(val as boolean)
          args.onCheckedChange?.(val as boolean)
        }}
      />
    )
  },
}

export const Checked: Story = {
  args: {
    id: "checkbox-checked",
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    id: "checkbox-disabled",
    disabled: true,
  },
}
