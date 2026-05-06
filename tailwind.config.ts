import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light theme foundation
        surface: "#f5f5f7",
        "card-blue": "#2563eb",
        "card-dark": "#111111",
        "card-soft": "#e8eeff",
        label: "#888888",
        // Updated semantic colors
        ink: "#111111",
        fog: "#888888",
        line: "rgba(0, 0, 0, 0.08)",
        // Accents (kept for workout mode + charts)
        moss: "#16a34a",
        violet: "#7c3aed",
        lavender: "#7c3aed",
        sand: "#d97706",
        // Legacy (kept for workout logger dark mode)
        night: "#050507",
        paper: "#08080b",
        steel: "#9b98aa",
        ember: "#f0c98d",
        aqua: "#a98bff",
        carbon: "#111118",
        graphite: "#191823"
      },
      boxShadow: {
        soft: "0 4px 24px rgba(0, 0, 0, 0.08)",
        glow: "0 0 34px rgba(124, 58, 237, 0.2)",
        card: "0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04)"
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "ring-fill": {
          "0%": { strokeDashoffset: "100" }
        }
      },
      animation: {
        "rise-in": "rise-in 420ms ease-out both",
        "ring-fill": "ring-fill 900ms ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
