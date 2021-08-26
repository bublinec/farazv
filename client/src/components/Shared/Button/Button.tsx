import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";
import React from "react";

export interface ButtonProps extends ChakraButtonProps {}

export const Button = (props: ButtonProps) => {
  return (
    <ChakraButton
      rounded="sm"
      py={6}
      px={8}
      _focus={{
        outline: "none",
      }}
      _hover={{
        bg: "trueGray.700",
      }}
      _active={{
        bg: "trueGray.600",
      }}
      color="white"
      bg="trueGray.800"
      {...props}
    />
  );
};
