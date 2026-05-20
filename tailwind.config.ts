import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "tip-red": "#E30613",
        "tip-red-dark": "#B00410",
        "tip-bg": "#0A0A0A",
        "tip-surface": "#141414",
        "tip-surface-2": "#0F0F0F",
        "tip-border": "#222",
        "tip-text": "#FFFFFF",
        "tip-muted": "#8A8A8A",
      },
      fontFamily: {
        display: ["Archivo Black", "sans-serif"],
        condensed: ["Barlow Condensed", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
