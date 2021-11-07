import { extendTheme } from "@chakra-ui/react";
import { darkGray } from "tailwindcss/colors";

const theme = {
  colors: {
    primary: "#012A57",
    primaryShade: "#012A57",
    secondary: "#E5AE49",
    darkGray: "#303030",
    lightGray: "#727272",
    black: "#000000"
  },
  fonts: {
    heading: "Ubuntu, sans-serif",
    body: "Ubuntu, sans-serif"
  },
  sizes: {
    container: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1480px"
    }
  }
};

export default extendTheme(theme);
