module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: "#012A57",
        primaryShade: "#012A57",
        secondary: "#E5AE49",
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
