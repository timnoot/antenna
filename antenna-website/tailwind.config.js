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
    screens: {
      'xs': '375px',
      // => @media (min-width: 375px) { ... }

      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }

      '3xl': '1650px',
      // => @media (min-width: 1650px) { ... }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
