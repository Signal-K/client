import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
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
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-nunito)", "ui-rounded", "sans-serif"],
        sans: ["var(--font-nunito)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "star-pattern": "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
        "star-pattern-dense": "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px), radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
        "sunburst": "radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)",
        "sunburst-lg": "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(var(--primary-rgb), 0.22) 0%, rgba(var(--accent-rgb), 0.08) 40%, transparent 70%)",
        "sunburst-hero": "radial-gradient(ellipse 120% 80% at 50% 100%, rgba(var(--primary-rgb), 0.3) 0%, rgba(var(--secondary-rgb), 0.1) 45%, transparent 70%)",
        "sci-fi-grid": "linear-gradient(rgba(var(--primary-rgb), 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--primary-rgb), 0.05) 1px, transparent 1px)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
        "scan-line": "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(var(--primary-rgb), 0.03) 2px, rgba(var(--primary-rgb), 0.03) 4px)",
      },
      backgroundSize: {
        "star-size": "32px 32px",
        "star-size-dense": "24px 24px, 48px 48px",
        "grid-size": "40px 40px",
      },
      boxShadow: {
        "glow-teal": "0 0 20px rgba(var(--primary-rgb), 0.4), 0 0 40px rgba(var(--primary-rgb), 0.15)",
        "glow-teal-sm": "0 0 8px rgba(var(--primary-rgb), 0.5)",
        "glow-amber": "0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.15)",
        "glow-sky": "0 0 20px rgba(56, 189, 248, 0.4), 0 0 40px rgba(56, 189, 248, 0.15)",
        "glow-violet": "0 0 20px rgba(167,139,250,0.4), 0 0 40px rgba(167,139,250,0.15)",
        "panel": "0 0 0 1px rgba(var(--primary-rgb), 0.15), 0 4px 24px rgba(0,0,0,0.2)",
        "panel-hover": "0 0 0 1px rgba(var(--primary-rgb), 0.35), 0 8px 32px rgba(0,0,0,0.3)",
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
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(var(--primary-rgb), 0.4)" },
          "50%": { boxShadow: "0 0 24px rgba(var(--primary-rgb), 0.8), 0 0 48px rgba(var(--primary-rgb), 0.3)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "dot-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.7" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "star-twinkle": {
          "0%, 100%": { opacity: "0.2", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.3)" },
        },
        orbit: {
          from: { transform: "rotate(0deg) translateX(var(--orbit-radius, 40px)) rotate(0deg)" },
          to: { transform: "rotate(360deg) translateX(var(--orbit-radius, 40px)) rotate(-360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "number-count": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scan-down": {
          "0%":   { top: "-2px", opacity: "0" },
          "4%":   { opacity: "1" },
          "96%":  { opacity: "0.6" },
          "100%": { top: "100%", opacity: "0" },
        },
        "radar-sweep": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s infinite ease-in-out",
        "pulse-glow": "pulse-glow 2.5s infinite ease-in-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-up": "fade-up 0.6s ease-out",
        "slide-up": "slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "dot-pulse": "dot-pulse 1.5s infinite ease-in-out",
        shimmer: "shimmer 2s infinite",
        "star-twinkle": "star-twinkle 3s infinite ease-in-out",
        orbit: "orbit 8s linear infinite",
        float: "float 4s ease-in-out infinite",
        "number-count": "number-count 0.4s ease-out",
        "scan-down": "scan-down 9s linear infinite",
        "radar-sweep": "radar-sweep 4s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config;
