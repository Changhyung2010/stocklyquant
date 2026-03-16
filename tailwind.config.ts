import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Using rgb(var(--x) / <alpha-value>) so Tailwind opacity modifiers work (e.g. bg-primary/10)
        background:          "rgb(var(--background) / <alpha-value>)",
        surface:             "rgb(var(--surface) / <alpha-value>)",
        "surface-highlight": "rgb(var(--surface-highlight) / <alpha-value>)",
        // Border: default opacity 0.08 via the function callback form
        border: ({ opacityValue }: { opacityValue: string | undefined }) =>
          `rgb(var(--border) / ${opacityValue ?? "0.08"})`,
        primary:             "rgb(var(--primary) / <alpha-value>)",
        secondary:           "rgb(var(--secondary) / <alpha-value>)",
        success:             "rgb(var(--success) / <alpha-value>)",
        danger:              "rgb(var(--danger) / <alpha-value>)",
        warning:             "rgb(var(--warning) / <alpha-value>)",
        "text-primary":      "rgb(var(--text-primary) / <alpha-value>)",
        "text-secondary":    "rgb(var(--text-secondary) / <alpha-value>)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  safelist: [
    // SCORE_CONFIG gradient values (used as dynamic template: `bg-gradient-to-br ${config.gradient}`)
    "from-emerald-500", "to-green-400",
    "from-green-500", "to-teal-400",
    "from-yellow-500", "to-amber-400",
    "from-orange-500", "to-amber-500",
    "from-red-500", "to-rose-500",
    // SCORE_CONFIG text values
    "text-emerald-400", "text-green-400", "text-yellow-400", "text-orange-400", "text-red-400",
    // FORMULA_STYLES / RISK_STYLES badge classes
    "bg-blue-500/10", "text-blue-400", "border-blue-500/20",
    "bg-teal-500/10", "text-teal-400", "border-teal-500/20",
    "bg-purple-500/10", "text-purple-400", "border-purple-500/20",
    "bg-orange-500/10", "text-orange-400", "border-orange-500/20",
    "bg-red-500/10", "text-red-400", "border-red-500/20",
    "bg-emerald-500/10", "text-emerald-400", "border-emerald-500/20",
    "bg-yellow-500/10", "text-yellow-400", "border-yellow-500/20",
    "bg-rose-500/10", "text-rose-400", "border-rose-500/20",
    "bg-green-500/10", "text-green-400", "border-green-500/20",
    // WeightBar color prop values
    "bg-blue-500", "bg-teal-500", "bg-purple-500", "bg-orange-500", "bg-rose-500", "bg-yellow-500",
    // AIAnalysis icon container backgrounds
    "bg-blue-500/10", "bg-emerald-500/10",
    "text-blue-400", "text-emerald-400",
  ],
  plugins: [],
};

export default config;
