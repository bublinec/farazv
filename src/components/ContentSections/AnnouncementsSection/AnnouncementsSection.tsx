import { Box } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import { getImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import React from "react";
import { useAnnouncements } from "../../../lib/features/announcement/hooks/useAnnouncements";
import { AnnouncementsSectionProps } from "../../../lib/features/page/content-sections.d.";
import { Container } from "../../Shared/Container/Container";
import { Overlay } from "../../Shared/Overlay/Overlay";
import { Text } from "../Text/Text";
import { AnnouncementsGrid } from "./AnnouncementsGrid";

export const AnnouncementsSection = (props: AnnouncementsSectionProps) => {
  const { heading, backgroundImage, useMostRecent, ...restOfProps } = props;

  let bgImage = null;
  if (backgroundImage) {
    const extractedImage = getImage(backgroundImage.localFile);
    const bgImage = convertToBgImage(extractedImage);
  }

  let announcements = useAnnouncements();
  if (!useMostRecent) {
    announcements = props.announcements.slice(0, 4);
  }

  return (
    <Box {...restOfProps}>
      {bgImage ? (
        <BackgroundImage {...bgImage} preserveStackingContext>
          <Overlay color="white" zIndex={0} opacity={90} />
          <Container py={backgroundImage ? 14 : 0} position="relative">
            <Text {...heading} />
            <AnnouncementsGrid announcements={announcements} />
          </Container>
        </BackgroundImage>
      ) : (
        <Container py={backgroundImage ? 14 : 0} position="relative">
          <Text {...heading} />
          <AnnouncementsGrid announcements={announcements} />
        </Container>
      )}
    </Box>
  );
};
