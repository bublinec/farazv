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
      <SimpleGrid columns={isSingle ? 1 : 2} gap={14}>
        {links.map((link) => (
          <Box boxShadow="2xl">
            <Iframe url={link} h={isSingle ? 704 : 328} />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};
