/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#DB4444",
          dark: "#B03434",
          light: "#FAD5D5",
        },
        success: "#00FF66",
        ink: {
          DEFAULT: "#000000",
          soft: "#1A1A1A",
        },
        muted: "#7D8184",
        line: "#E7E7E7",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      maxWidth: {
        content: "1170px",
      },
    },
  },
  plugins: [],
};