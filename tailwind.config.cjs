/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        green: "#1d8954",
        dark: "#191414",
        primary: "#ffffff",
        "light-black": "#282828",
        secondary: "#b3b3b3",
        gray: "#535353",
      },
      gridTemplateColumns: {
        "auto-fill-cols": "repeat(auto-fill, minmax(200px, 1fr))",
      },
    },
  },
  plugins: [],
};
