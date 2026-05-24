/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        premium: "0 24px 80px rgba(15, 23, 42, 0.12)",
      },
      borderRadius: {
        premium: "2rem",
      },
    },
  },
  plugins: [],
};
