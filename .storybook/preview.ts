import type { Preview } from "@storybook/nextjs-vite"
import "../src/app/globals.css"

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "Dark-700",
      values: [
        {
          name: "Dark-700",
          value: "var(--dark-700)",
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
}
