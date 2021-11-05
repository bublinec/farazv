import { Box, BoxProps, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { Button } from "../../Shared/Button/Button";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";
import { AnnouncementCard } from "./AnnouncementCard";
import { useAnnouncements } from "./hooks/useAnnouncements";

export interface AnnouncementsSectionProps extends BoxProps {}

export const AnnouncementsSection = (props: AnnouncementsSectionProps) => {
  const { ...restOfProps } = props;
  const announcements = useAnnouncements();
  console.log(announcements);

  return (
    <Box {...restOfProps}>
      <SectionHeading heading="Výveska" superscript="Aktuality" mb={6} />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={{ base: 4, md: 8 }}>
        {announcements.map((a) => {
          return (
            <AnnouncementCard
              title={a.title}
              date={"a.published_at"}
              description={a.description}
              cta={{
                url: "#",
                text: "Čítať ďalej"
              }}
            />
          );
        })}
      </SimpleGrid>
    </Box>
  );
};
