import { Scroll } from "./Scroll"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/Scroll",
  component: Scroll,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Скрол на основе Radix UI.

Для скролинга необходимо передать элементы в children компоненты Scroll и задать размеры`,
      },
    },
  },
} satisfies Meta<typeof Scroll>

export default meta
type Story = StoryObj<typeof Scroll>

const TAGS = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`) // Содержимое для скрола
const verticalContent = (
  <div style={{ padding: "15px 20px" }}>
    <div>Tags</div>

    {TAGS.map((tag) => (
      <div key={tag}>{tag}</div>
    ))}
  </div>
)
const horizontalContent = (
  <div style={{ display: "flex", gap: "10px", padding: "80px 10px" }}>
    {Array.from({ length: 20 }, (_, i) => (
      <div
        key={i}
        style={{
          minWidth: "50px",
          height: "50px",
          background: "#5a5757",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Card {i + 1}
      </div>
    ))}
  </div>
)

export const Vertical: Story = {
  render: () => (
    <Scroll style={{ width: "200px", height: "225px", border: "2px solid #ccc" }}>{verticalContent}</Scroll>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <Scroll
      style={{
        width: "200px",
        height: "225px",
        border: "2px solid #ccc",
      }}
    >
      {horizontalContent}
    </Scroll>
  ),
}
