/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E1E2C",
        secondary: "#282A36",
        accentcolor: "#FF79C6",
        text: "#F8F8F2",
        background: "#141414",
        secondarybackground: "#1E1E1E",
        border: "#44475A",
        hover: "#6272A4"

      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
