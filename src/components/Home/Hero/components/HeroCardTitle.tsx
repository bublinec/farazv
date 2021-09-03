import { Box } from "@chakra-ui/react";
import React from "react";
import { ReactNode } from "react-markdown";

export interface HeroCardTitleProps {
  className?: string;
  children: ReactNode;
}

export const HeroCardTitle = (props: HeroCardTitleProps) => {
  const { className = "", children } = props;
  return (
    <Box
      as="h3"
      _after={{
        content: "' '",
        height: "4px",
        position: "absolute",
        width: "10",
        bgColor: "primary",
        bottom: "-2.5",
        left: "0",
      }}
      className={`${className} relative font-bold tracking-widest text-lg uppercase`}
    >
      {children}
    </Box>
  );
};
