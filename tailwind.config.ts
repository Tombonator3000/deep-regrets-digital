import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          hover: "hsl(var(--card-hover))",
        },
        // Deep Regrets game colors
        sea: {
          deep: "hsl(var(--sea-deep))",
          medium: "hsl(var(--sea-medium))",
          shallow: "hsl(var(--sea-shallow))",
        },
        tentacle: {
          DEFAULT: "hsl(var(--tentacle))",
          glow: "hsl(var(--tentacle-glow))",
        },
        fishbuck: "hsl(var(--fishbuck))",
        regret: "hsl(var(--regret))",
        madness: "hsl(var(--madness))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(100vh) scale(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-10vh) scale(1)", opacity: "0" },
        },
        "tentacle-sway": {
          "0%, 100%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(3deg) scale(1.05)" },
        },
        "card-reveal": {
          "0%": { transform: "rotateY(180deg) scale(0.8)", opacity: "0" },
          "50%": { transform: "rotateY(90deg) scale(1.1)" },
          "100%": { transform: "rotateY(0deg) scale(1)", opacity: "1" },
        },
        "dice-roll": {
          "0%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(90deg) scale(1.1)" },
          "50%": { transform: "rotate(180deg) scale(0.9)" },
          "75%": { transform: "rotate(270deg) scale(1.1)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "regret-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px hsl(var(--regret) / 0.3)" },
          "50%": { boxShadow: "0 0 20px hsl(var(--regret) / 0.8)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 8s infinite ease-in-out",
        "tentacle-sway": "tentacle-sway 6s infinite ease-in-out",
        "card-reveal": "card-reveal 0.6s ease-out",
        "dice-roll": "dice-roll 1s ease-in-out",
        "regret-pulse": "regret-pulse 2s infinite ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
