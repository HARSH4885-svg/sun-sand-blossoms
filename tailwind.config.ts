import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FFF9F0",
        sand: "#E8D4B5",
        sunset: "#F28C45",
        blossom: "#F2A6B3",
        tropical: "#315B46",
        cocoa: "#34251F",
        gold: "#D9A441",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "1.5rem" },
      boxShadow: {
        soft: "0 20px 50px -25px rgba(52,37,31,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
