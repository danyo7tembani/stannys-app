import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        luxe: {
          noir: "#0a0a0a",
          "noir-soft": "#141414",
          or: "#c9a227",
          "or-hover": "#d4af37",
          "or-muted": "#8b7355",
          blanc: "#fafafa",
          "blanc-muted": "#a3a3a3",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-cormorant)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      transitionDuration: {
        "400": "400ms",
      },
    },
  },
  plugins: [],
  safelist: [
    "max-h-[90vh]",
    "w-[min(94vw,52rem)]",
    "min-w-[320px]",
  ],
};

export default config;
