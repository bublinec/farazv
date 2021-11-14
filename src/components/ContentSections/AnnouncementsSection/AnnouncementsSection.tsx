import { Box, SimpleGrid } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import { getImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import React from "react";
import { useAnnouncements } from "../../../lib/features/announcement/hooks/useAnnouncements";
import { AnnouncementsSectionProps } from "../../../lib/features/page/content-sections.d.";
import { shorten } from "../../../lib/utils/stringUtils";
import { Container } from "../../Shared/Container/Container";
import { Overlay } from "../../Shared/Overlay/Overlay";
import { Text } from "../Text/Text";
import { AnnouncementCard } from "./AnnouncementCard";

export const ANNOUNCEMENT_DESCRIPTION_MAX_LENGTH = 240;

export const AnnouncementsSection = (props: AnnouncementsSectionProps) => {
  const { heading, backgroundImage, useMostRecent, ...restOfProps } = props;

  console.log(backgroundImage);

  const extractedImage = getImage(backgroundImage.localFile);
  const bgImage = convertToBgImage(extractedImage);

  let announcements = useAnnouncements();
  if (!useMostRecent) {
    announcements = props.announcements;
  }

  console.log(bgImage);

  return (
    <Box {...restOfProps}>
      <BackgroundImage {...bgImage} preserveStackingContext>
        <Overlay color="white" zIndex={0} opacity={90} />
        <Container py={backgroundImage ? 14 : 0} position="relative">
          <Box>
            <Text {...heading} />
          </Box>
          <SimpleGrid
            zIndex={20}
            columns={{ base: 1, md: 2, xl: 3 }}
            gap={{ base: 10, md: 8 }}
          >
            {announcements.map((a) => {
              return (
                <AnnouncementCard
                  title={a.title}
                  date={a.published_at}
                  description={shorten(
                    a.description || a.content,
                    ANNOUNCEMENT_DESCRIPTION_MAX_LENGTH
                  )}
                  key={a.published_at}
                  cta={{
                    url: `/vyveska/${a.slug}`,
                    text: "Čítať ďalej"
                  }}
                />
              );
            })}
          </SimpleGrid>
        </Container>
      </BackgroundImage>
    </Box>
  );
};
