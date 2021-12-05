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
        columns={{ base: 1, md: 2, xl: announcements.length }}
        gap={{ base: 10, md: 8 }}
      >
        {announcements.map((a) => {
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
