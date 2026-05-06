import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#f8f3e7",
        paper: "#08080b",
        line: "rgba(248, 243, 231, 0.12)",
        steel: "#9b98aa",
        moss: "#82f0aa",
        ember: "#f0c98d",
        aqua: "#a98bff",
        night: "#050507",
        carbon: "#111118",
        graphite: "#191823",
        violet: "#8f6cff",
        lavender: "#d7c7ff",
        sand: "#f0c98d",
        fog: "#c7c2d8"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0, 0, 0, 0.4)",
        glow: "0 0 34px rgba(143, 108, 255, 0.28)"
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
