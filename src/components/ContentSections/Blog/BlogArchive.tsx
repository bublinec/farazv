import { Box, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";

interface BlogArchiveProps {}

export const BlogArchive = (props: BlogArchiveProps) => {
  return (
    <Box>
      <SectionHeading heading={"Archív"} superscript="Naše Spoločenstvo" />
      <SimpleGrid
        spacing={{ base: 8, md: 10 }}
        py={20}
        columns={{ base: 1, md: 3 }}
      ></SimpleGrid>
    </Box>
  );
};
