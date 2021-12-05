import { Box, BoxProps } from "@chakra-ui/react";
import { Link } from "gatsby";
import React, { ReactNode } from "react";
import { LinkItemLabel } from "./LinkItemLabel";

export interface LinkItemProps extends BoxProps {
  label: string;
  to?: string;
  icon?: ReactNode;
  hoverColor?: string;
}

export const LinkItem = (props: LinkItemProps) => {
  const {
    icon,
    label,
    to,
    color = "white",
    hoverColor = "secondary",
    ...restOfProps
  } = props;
  return (
    <Box {...restOfProps}>
      {to ? (
        <Link to={to}>
          <LinkItemLabel
            color={color}
            label={label}
            icon={icon}
            _hover={{ color: hoverColor, transition: "all ease-in-out 200ms" }}
          />
        </Link>
      ) : (
        <LinkItemLabel label={label} icon={icon} />
      )}
    </Box>
  );
};
