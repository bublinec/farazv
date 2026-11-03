module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: "#2E5268",
        primaryShade: "#204358",
        secondary: "#BFA169",
        secondaryShade: "#DDB66F",
        darkGray: "#303030",
        lightGray: "#727272",
        black: "#000000"
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
