import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        steel: "#182235",
        aqua: "#22d3ee",
        mint: "#34d399",
        amber: "#f59e0b",
        signal: "#7c3aed"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(8, 18, 40, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
