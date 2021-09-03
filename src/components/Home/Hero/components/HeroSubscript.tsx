import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import { ReactNode } from "react-markdown";

export interface HeroSubscriptProps extends BoxProps {
  className?: string;
  children: ReactNode;
}

export const HeroSubscript = (props: HeroSubscriptProps) => {
  const { className = "", children } = props;
  return (
    <Box
      color="#b6a281"
      className="superscript uppercase text-4xl tracking-widest font-medium relative"
      lineHeight={{
        base: "6",
        sm: "10",
      }}
      fontSize={{
        base: "initial",
        sm: "2xl",
        md: "3xl",
        xl: "4xl",
      }}
      mb="4"
      _after={{
        content: "' '",
        width: "120px",
        position: "absolute",
        bottom: {
          base: "-1",
          md: "-4",
        },
        left: "0",
        right: "0",
        height: "1px",
        zIndex: "10",
        mx: "auto",
        bgColor: "#b6a281",
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
