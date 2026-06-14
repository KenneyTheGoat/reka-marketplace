import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        veld: "#2f6f4e",
        aloe: "#d8e8cd",
        sun: "#f7b733",
        clay: "#a75232",
        mist: "#f5f7f3"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(23, 32, 27, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;

