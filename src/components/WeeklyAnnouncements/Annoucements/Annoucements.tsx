import { Box, HStack, Stack } from "@chakra-ui/react";
import React from "react";
import { MarkdownRenderer } from "../../Shared/MarkdownRenderer/MarkdownRenderer";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";

export interface AnnouncmentProps {
  announcements: Array<{ text: string }>;
}

export const Annoucements = (props: AnnouncmentProps) => {
  const { announcements, ...restOfProps } = props;
  return (
    <Box {...restOfProps} w="full">
      <Stack spacing={{ base: 2, md: 5 }}>
        <SectionHeading heading="Oznamy" superscript="Farské oznamy" />
        {announcements.map((announcement) => {
          return (
            <HStack alignItems={"flex-start"}>
              <Box fontSize="2xl" color="primary" mt={-1}>
                ✓
              </Box>
              <MarkdownRenderer
                w="full"
                children={announcement.text}
                fontWeight={300}
              />
            </HStack>
          );
        })}
      </Stack>
    </Box>
  );
};
