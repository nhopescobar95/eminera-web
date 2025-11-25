/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#0cc4b8",
        "brand-secondary": "#fb6b31",
        "brand-purple": "#c881d3",
        "brand-yellow": "#f8bd26",
        "brand-dark": "#1e293b",
      },
    },
  },
  plugins: [],
};
