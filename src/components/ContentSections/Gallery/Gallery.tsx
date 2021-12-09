import { Box, Stack } from "@chakra-ui/react";
import React from "react";
import { GalleryProps } from "../../../lib/features/page/content-sections.d";
import { Container } from "../../Shared/Container/Container";
import { LinkButton } from "../../Shared/LinkButton/LinkButton";
import { UniversalGallery } from "../../Shared/UniversalGallery/UniversalGallery";
import { Text } from "../Text/Text";

export const Gallery = (props: GalleryProps) => {
  const { heading, images, button, ...restOfProps } = props;

  return (
    <Box {...restOfProps}>
      <Container>
        <Stack spacing={{ base: 10, md: 12 }}>
          <Stack>
            {heading && <Text {...heading} />}
            <UniversalGallery
              galleryKey={heading?.title || "gallery"}
              images={images}
            />
          </Stack>
          {button && (
            <LinkButton
              to={button.link}
              external={button.external}
              alignSelf={"center"}
            >
              {button.text}
            </LinkButton>
          )}
        </Stack>
      </Container>
    </Box>
  );
};
