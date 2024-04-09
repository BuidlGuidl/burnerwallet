/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#DFE142",
          "primary-content": "#212638",
          secondary: "#FFE2C7",
          "secondary-content": "#FF7A00",
          accent: "#93BBFB",
          "accent-content": "#212638",
          neutral: "#ffffff",
          "neutral-content": "#212638",
          "base-100": "#faf7f5",
          "base-200": "#ffffff",
          "base-300": "#DAE8FF",
          "base-content": "#212638",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
          "--border-muted": "#e5e7eb",
        },
      },
      {
        dark: {
          primary: "#e779c1",
          "primary-content": "#F9FBFF",
          secondary: "#58c7f3",
          "secondary-content": "#F9FBFF",
          accent: "#4969A6",
          "accent-content": "#F9FBFF",
          neutral: "#ffffff",
          "neutral-content": "#212638",
          "base-100": "#27272A",
          "base-200": "#1a103d",
          "base-300": "#212638",
          "base-content": "#f9f7fd",
          info: "#53c0f3",
          "info-content": "#201047",
          success: "#71ead2",
          "success-content": "#201047",
          warning: "#eace6c",
          "warning-content": "#201047",
          error: "#ec8c78",
          "error-content": "#201047",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
          "--border-muted": "#374151",
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      colors: {
        "border-muted": "var(--border-muted)",
      },
    },
  },
};
