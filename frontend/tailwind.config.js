/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#151A23",
          light: "#1E2530",
          border: "#2B3340",
        },
        parchment: {
          DEFAULT: "#EDE6D6",
          dark: "#E1D8C3",
          text: "#2A2620",
        },
        brass: {
          DEFAULT: "#C98A3E",
          dark: "#A96F2C",
          light: "#DDA75E",
        },
        sage: {
          DEFAULT: "#5B8266",
          light: "#7EA088",
          bg: "#22301F",
        },
        clay: {
          DEFAULT: "#9C4A3C",
          light: "#BC6B5C",
          bg: "#301F1D",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        settle: {
          "0%": { transform: "scale(0.85) rotate(-6deg)", opacity: "0" },
          "60%": { transform: "scale(1.05) rotate(2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-3deg)", opacity: "1" },
        },
      },
      animation: {
        blink: "blink 1s step-start infinite",
        settle: "settle 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [],
};
