import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0D0C0F",
        deep: "#121117",
        card: "#1A1920",
        raised: "#252330",
        gold: "#F5C842",
        purple: "#9B6DFF",
        pink: "#FF6B9D",
        teal: "#3ECFB0",
        orange: "#FF8C42",
        danger: "#FF4D6D"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Tahoma", "Arial", "sans-serif"],
        serif: ["var(--font-serif)", "serif"]
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 0, 0, 0.45)",
        glow: "0 0 40px rgba(155, 109, 255, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
