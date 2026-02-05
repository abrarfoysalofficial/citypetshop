import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          foreground: "var(--brand-foreground)",
          muted: "var(--brand-muted)",
          accent: "var(--brand-accent)",
          dark: "var(--brand-dark)",
        },
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--brand)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
      },
      maxWidth: {
        "content": "1280px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
