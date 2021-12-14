import { extendTheme } from "@chakra-ui/react";
import { darkGray } from "tailwindcss/colors";

const theme = {
  colors: {
    primary: "#193F56",
    primaryShade: "#0f2634",
    secondary: "#B4893A",
    secondaryShade: "#D3A247",
    darkGray: "#303030",
    lightGray: "#727272",
    borderGray: "#7272721c",
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
