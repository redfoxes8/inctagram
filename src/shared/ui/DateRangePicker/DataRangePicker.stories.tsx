import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { DateRangePicker } from "./DateRangePicker"
import { useState, type ComponentProps } from "react"

const meta: Meta<typeof DateRangePicker> = {
  title: "Components/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["single", "range", "multiple"],
    },
  },
}

export default meta
type Story = StoryObj<typeof DateRangePicker>

function SingleStory(args: ComponentProps<typeof DateRangePicker>) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div style={{ width: "300px" }}>
      <DateRangePicker {...args} mode="single" value={date} onChange={setDate} />
    </div>
  )
}

function RangeStory(args: ComponentProps<typeof DateRangePicker>) {
  const [range, setRange] = useState<{ from: Date; to?: Date } | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  })

  return (
    <div style={{ width: "300px" }}>
      <DateRangePicker {...args} mode="range" value={range} onChange={setRange} />
    </div>
  )
}

function MultipleStory(args: ComponentProps<typeof DateRangePicker>) {
  const [dates, setDates] = useState<Date[] | undefined>([new Date()])

  return (
    <div style={{ width: "300px" }}>
      <DateRangePicker {...args} mode="multiple" value={dates} onChange={setDates} />
    </div>
  )
}

export const Single: Story = {
  render: (args: ComponentProps<typeof DateRangePicker>) => <SingleStory {...args} />,
  args: {
    label: "Date",
    placeholder: "08.02.2026",
  },
}

export const Range: Story = {
  render: (args: ComponentProps<typeof DateRangePicker>) => <RangeStory {...args} />,
  args: {
    label: "Date range",
    placeholder: "08.02.2026 - 20.02.2026",
  },
}

export const Multiple: Story = {
  render: (args: ComponentProps<typeof DateRangePicker>) => <MultipleStory {...args} />,
  args: {
    label: "Date",
    placeholder: "Select multiple days",
  },
}

export const WithError: Story = {
  args: {
    mode: "single",
    label: "Date",
    error: "Error, select current month or last month",
  },
}

export const Disabled: Story = {
  args: {
    mode: "single",
    label: "Date",
    disabled: true,
    value: new Date(),
  },
}
