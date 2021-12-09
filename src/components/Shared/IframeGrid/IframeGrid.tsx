import { Box, BoxProps, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { Iframe } from "../Iframe/Iframe";

export interface IframeGridProps extends BoxProps {
  links: string[];
}

export const IframeGrid = (props: IframeGridProps) => {
  const { links, ...restOfProps } = props;
  const isSingle = links.length === 1;
  return (
    <Box {...restOfProps}>
      <SimpleGrid
        columns={{ base: 1, md: isSingle ? 1 : 2 }}
        gap={{ base: 10, md: 12 }}
      >
        {links.map((link) => (
          <Box boxShadow="2xl">
            <Iframe url={link} />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};
