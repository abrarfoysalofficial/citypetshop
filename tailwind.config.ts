import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "390px",   // iPhone 14 / modern small phones
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          foreground: "var(--brand-foreground)",
          muted: "var(--brand-muted)",
          accent: "var(--brand-accent)",
          dark: "var(--brand-dark)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          900: "var(--primary-900)",
          700: "var(--primary-700)",
        },
        "header-bg": "var(--header-bg)",
        "footer-bg": "var(--footer-bg)",
        secondary: "var(--secondary)",
        accent: {
          DEFAULT: "var(--accent)",
          500: "var(--accent-500)",
          300: "var(--accent-300)",
        },
        cta: {
          DEFAULT: "var(--cta)",
          hover: "var(--cta-hover)",
          foreground: "var(--cta-foreground)",
        },
        "brand-bg": {
          DEFAULT: "var(--brand-bg)",
          hover: "var(--brand-bg-hover)",
          foreground: "var(--brand-bg-foreground)",
        },
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        "bg-page": "var(--bg-page)",
        "bg-card": "var(--bg-card)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, var(--primary-gradient-from) 0%, var(--primary-gradient-to) 100%)",
        "gradient-teal": "linear-gradient(135deg, #00BBD4 0%, #2EE6A6 100%)",
      },
      borderRadius: {
        card: "16px",
        "card-lg": "18px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(11, 28, 61, 0.06)",
        card: "0 4px 12px rgba(11, 28, 61, 0.08)",
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
