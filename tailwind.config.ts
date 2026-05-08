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
        background: "#050816",
        "secondary-background": "#0A1020",
        "card-bg": "rgba(15, 23, 42, 0.7)",
        "cyan-accent": "#00F5D4",
        "cyan-glow": "#00FFE0",
        "border-color": "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        sora: ["var(--font-sora)", "sans-serif"],
        roboto: ["var(--font-roboto)", "sans-serif"],
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-cyan": "linear-gradient(135deg, #00F5D4 0%, #00B7FF 100%)",
        "gradient-dark": "linear-gradient(180deg, rgba(10,16,32,0) 0%, #0A1020 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
