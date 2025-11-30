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
        // New game polish animations
        "boat-bob": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-3px) rotate(2deg)" },
          "75%": { transform: "translateY(2px) rotate(-2deg)" },
        },
        "coin-spin": {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(180deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        "ripple": {
          "0%": { width: "0", height: "0", opacity: "0.5" },
          "100%": { width: "200px", height: "200px", opacity: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { filter: "drop-shadow(0 0 5px var(--glow-color, hsl(var(--primary))))" },
          "50%": { filter: "drop-shadow(0 0 20px var(--glow-color, hsl(var(--primary))))" },
        },
        "score-float": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-50px)", opacity: "0" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up-fade": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "token-appear": {
          "0%": { transform: "scale(0) rotate(-180deg)", opacity: "0" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "success-burst": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        // Fish catch celebration
        "fish-catch": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "25%": { transform: "scale(1.3)", opacity: "1" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "75%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // Animated counter pulse
        "counter-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
        // Shoal hover glow
        "shoal-glow": {
          "0%, 100%": { boxShadow: "0 0 5px hsl(var(--primary) / 0.3), inset 0 0 5px hsl(var(--primary) / 0.1)" },
          "50%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.6), inset 0 0 10px hsl(var(--primary) / 0.2)" },
        },
        // Madness warning pulse
        "madness-warning": {
          "0%, 100%": { boxShadow: "0 0 5px hsl(var(--destructive) / 0.3)", borderColor: "hsl(var(--destructive) / 0.4)" },
          "50%": { boxShadow: "0 0 25px hsl(var(--destructive) / 0.7)", borderColor: "hsl(var(--destructive) / 0.8)" },
        },
        // Plug erosion effect
        "plug-erosion": {
          "0%": { transform: "scale(1) rotate(0deg)", filter: "brightness(1)" },
          "25%": { transform: "scale(1.1) rotate(-5deg)", filter: "brightness(1.2)" },
          "50%": { transform: "scale(0.95) rotate(5deg)", filter: "brightness(0.9)" },
          "75%": { transform: "scale(1.05) rotate(-3deg)", filter: "brightness(1.1)" },
          "100%": { transform: "scale(1) rotate(0deg)", filter: "brightness(1)" },
        },
        // Enhanced boat bob for current player
        "boat-bob-active": {
          "0%, 100%": { transform: "translateY(0) rotate(-3deg)" },
          "25%": { transform: "translateY(-4px) rotate(0deg)" },
          "50%": { transform: "translateY(0) rotate(3deg)" },
          "75%": { transform: "translateY(-2px) rotate(0deg)" },
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
        // New game polish animations
        "boat-bob": "boat-bob 2s ease-in-out infinite",
        "coin-spin": "coin-spin 3s ease-in-out infinite",
        "ripple": "ripple 0.6s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "score-float": "score-float 1s ease-out forwards",
        "shake": "shake 0.5s ease-in-out",
        "bounce-in": "bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "slide-up-fade": "slide-up-fade 0.3s ease-out",
        "token-appear": "token-appear 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "success-burst": "success-burst 0.5s ease-out forwards",
        // New game polish animations
        "fish-catch": "fish-catch 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "counter-pop": "counter-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "shoal-glow": "shoal-glow 1.5s ease-in-out infinite",
        "madness-warning": "madness-warning 1s ease-in-out infinite",
        "plug-erosion": "plug-erosion 2s ease-in-out infinite",
        "boat-bob-active": "boat-bob-active 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
