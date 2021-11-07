import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps
} from "@chakra-ui/react";
import React from "react";

export interface ButtonProps extends ChakraButtonProps {}

export const Button = (props: ButtonProps) => {
  const { children, ...restOfProps } = props;

  return (
    <ChakraButton
      rounded="none"
      // py={5}
      // px={6}
      color="primary"
      bg="none"
      // fontSize="lg"
      borderWidth={"2px"}
      borderColor={"primary"}
      {...restOfProps}
    >
      {children}
    </ChakraButton>
  );
};
