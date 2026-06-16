import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#08090f",
        panel: "#11131d",
        line: "#262a3a",
        neon: "#6ee7b7",
        pulse: "#fb7185"
      },
      boxShadow: {
        glow: "0 18px 70px rgba(110, 231, 183, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
