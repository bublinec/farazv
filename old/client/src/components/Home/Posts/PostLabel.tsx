import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

export interface PostLabelProps extends BoxProps {
  label: string;
}

export const PostLabel = (props: PostLabelProps) => {
  const { label, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Box
        bg="primary"
        color="white"
        textTransform={"uppercase"}
        px={5}
        fontSize={"md"}
        py={1.5}
        fontWeight={300}
        w={"max-content"}
        mt={-9}
        zIndex={2}
        position={"absolute"}
        letterSpacing={"widest"}
      >
        {label}
      </Box>
    </Box>
  );
};
