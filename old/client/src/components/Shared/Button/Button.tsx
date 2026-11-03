import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps
} from "@chakra-ui/react";
import React from "react";
import { ButtonTypes } from "../../../lib/features/page/content-sections.d";

export interface ButtonProps extends ChakraButtonProps {
  buttonType?: ButtonTypes;
}

export const typeToColorMap = {
  primary: "primary",
  secondary: "white"
};

export const Button = (props: ButtonProps) => {
  const { children, buttonType = ButtonTypes.primary, ...restOfProps } = props;

  return (
    <ChakraButton
      rounded="none"
      color={typeToColorMap[buttonType]}
      bg="none"
      fontWeight={buttonType === ButtonTypes.secondary ? 500 : 600}
      _hover={{
        bg: "none"
      }}
      borderWidth={"2px"}
      borderColor={typeToColorMap[buttonType]}
      {...restOfProps}
    >
      {children}
    </ChakraButton>
  );
};
