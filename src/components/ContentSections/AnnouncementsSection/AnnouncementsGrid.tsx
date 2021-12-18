import { Box, BoxProps, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { Announcement } from "../../../lib/features/announcement/model/announcement.model";
import { AnnouncementCard } from "./AnnouncementCard";

export interface AnnouncementsGridProps extends BoxProps {
  announcements: Announcement[];
}

export const ANNOUNCEMENT_DESCRIPTION_MAX_LENGTH = 2240;

export const AnnouncementsGrid = (props: AnnouncementsGridProps) => {
  const { announcements, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <SimpleGrid
        zIndex={20}
        columns={{ base: 1, md: 3, xl: 3 }}
        gap={{ base: 8, md: 8, lg: 12 }}
      >
        {announcements.slice(0, 3).map((a) => {
          return (
            <AnnouncementCard
              title={a.title}
              date={a.published_at}
              description={a.description || a.content}
              key={a.published_at}
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
