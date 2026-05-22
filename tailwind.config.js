/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0b0d10",
          soft: "#13161b",
          card: "#181c22",
          elevated: "#1f242c",
        },
        line: "#272d36",
        ink: {
          DEFAULT: "#f4f6f9",
          soft: "#aab2bf",
          faint: "#6b7480",
        },
        accent: {
          DEFAULT: "#3aa7d0",
          soft: "#2b7e9e",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "Roboto",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(58,167,208,0.4), 0 8px 30px -8px rgba(58,167,208,0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        pulse_dot: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease both",
        shimmer: "shimmer 1.4s infinite",
        "pulse-dot": "pulse_dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
