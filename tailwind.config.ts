import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF7F0",
        "paper-alt": "#F1ECE1",
        ink: "#1C1B19",
        "ink-soft": "#57534A",
        maroon: "#7A1F2B",
        "maroon-soft": "#9A3B47",
        navy: "#1F3A5F",
        verified: "#2F6B4F",
        border: "#D9D2C2",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        perforate:
          "repeating-linear-gradient(90deg, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
