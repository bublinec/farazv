import { Box } from "@chakra-ui/react";
import React from "react";
import { GalleryProps } from "../../../lib/features/page/content-sections.d.";
import { UniversalGallery } from "../../Shared/UniversalGallery/UniversalGallery";
import { Text } from "../Text/Text";

export const Gallery = (props: GalleryProps) => {
  const { heading, images, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Text {...heading} />
      <UniversalGallery
        galleryKey={heading?.title || "gallery"}
        images={images}
      />
    </Box>
  );
};
