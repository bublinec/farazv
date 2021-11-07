import { Box, BoxProps, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { shorten } from "../../../lib/utils/stringUtils";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";
import { AnnouncementCard } from "./AnnouncementCard";
import { useAnnouncements } from "./hooks/useAnnouncements";

export interface AnnouncementsSectionProps extends BoxProps {}
export const ANNOUNCEMENT_DESCRIPTION_MAX_LENGTH = 240;

export const AnnouncementsSection = (props: AnnouncementsSectionProps) => {
  const { ...restOfProps } = props;
  const announcements = useAnnouncements();

  return (
    <Box {...restOfProps}>
      <SectionHeading heading="Výveska" superscript="Aktuality" mb={6} />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={{ base: 10, md: 8 }}>
        {announcements.map((a) => {
          return (
            <AnnouncementCard
              title={a.title}
              date={a.published_at}
              description={shorten(
                a.description || a.content,
                ANNOUNCEMENT_DESCRIPTION_MAX_LENGTH
              )}
              cta={{
                url: `/vyveska/${a.slug}`,
                text: "Čítať ďalej"
              }}
            />
          );
        })}
      </SimpleGrid>
    </Box>
  );
};
