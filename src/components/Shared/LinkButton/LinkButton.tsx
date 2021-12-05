import { Box, BoxProps } from "@chakra-ui/react";
import { Link } from "gatsby";
import React from "react";
import { Button, ButtonProps } from "../Button/Button";

export interface LinkButtonProps extends BoxProps {
  buttonProps?: ButtonProps;
  children: string;
  to: string;
  external?: boolean;
}

export const LinkButton = (props: LinkButtonProps) => {
  const {
    children,
    to,
    external = false,

    buttonProps,
    ...restOfProps
  } = props;

  return (
    <Box {...restOfProps}>
      <Link
        to={to}
        target={external ? "_blank" : "_self"}
        rel={external ? "noopener noreferer" : ""}
      >
        <Button {...buttonProps}>{children}</Button>
      </Link>
    </Box>
  );
};
