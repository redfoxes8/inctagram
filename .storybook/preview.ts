import type { Preview } from "@storybook/nextjs-vite"
import "../src/app/globals.css"

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        // 👇 Default options
        //dark: { name: "Dark", value: "#333" },
        //light: { name: "Light", value: "#F7F9F2" },

        // 👇 Add your own
        dark: { name: "Dark", value: "var(--dark-700)" },
        light: { name: "Light", value: "var(--light-700)" },
      },
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
  initialGlobals: {
    // 👇 Set the initial background color
    backgrounds: { value: "dark" },
  },
}
export default preview
