import { Box, HStack, Stack } from "@chakra-ui/react";
import React from "react";
import { MarkdownRenderer } from "../../Shared/MarkdownRenderer/MarkdownRenderer";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";

export interface AnnouncmentProps {
  announcments: Array<{ text: string }>;
}

export const Annoucements = (props: AnnouncmentProps) => {
  const { announcments, ...restOfProps } = props;
  return (
    <Box {...restOfProps} w="full">
      <SectionHeading heading="Oznamy" superscript="Farské oznamy" />
      <Stack spacing={{ base: 2, md: 5 }}>
        {announcments.map((annoucement) => {
          return (
            <HStack alignItems={"flex-start"}>
              <Box fontSize="2xl" color="primary" mt={-1}>
                ✓
              </Box>
              <MarkdownRenderer
                w="full"
                children={annoucement.text}
                fontWeight={300}
              />
            </HStack>
          );
        })}
      </Stack>
    </Box>
  );
};
