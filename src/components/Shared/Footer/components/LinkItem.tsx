import { Box, BoxProps } from "@chakra-ui/react";
import { Link } from "gatsby";
import React, { ReactNode } from "react";
import { isExternal } from "../../../../lib/utils/routeUtils";
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

  if (!to) {
    return <LinkItemLabel label={label} icon={icon} />;
  }

  return (
    <Box {...restOfProps}>
      {!isExternal(to) ? (
        <Link to={to}>
          <LinkItemLabel
            color={color}
            label={label}
            icon={icon}
            _hover={{ color: hoverColor, transition: "all ease-in-out 200ms" }}
          />
        </Link>
      ) : (
        <a href={to} target={"_blank"} rel={"noopener noreferer"}>
          <LinkItemLabel
            label={label}
            icon={icon}
            color={color}
            _hover={{ color: hoverColor, transition: "all ease-in-out 200ms" }}
          />
        </a>
      )}
    </Box>
  );
};
