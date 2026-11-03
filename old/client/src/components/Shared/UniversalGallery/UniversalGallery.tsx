import { AspectRatio, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import SimpleReactLightbox, { SRLWrapper } from "simple-react-lightbox";
import { Image } from "../../../lib/features/image/model/image.model";
import { ImageCard } from "./components/ImageCard";

export interface UniversalGalleryProps {
  galleryKey: string;
  images: Image[];
}

export const galleryConfig = {
  base: {
    columns: { base: 3, md: 3, lg: 3 },
    gap: { base: 4, md: 6 }
  },
  large: {
    columns: { base: 2, md: 4, lg: 4, xl: 4 },
    gap: { base: 3, md: 4 }
  }
};

export const UniversalGallery = (props: UniversalGalleryProps) => {
  const { galleryKey, images } = props;
  // const size = images.length > 12 ? "large" : "base";
  const size = "large";

  return (
    <SimpleReactLightbox>
      <SRLWrapper key={galleryKey}>
        <SimpleGrid
          {...(images.length <= 3
            ? { columns: images.length, gap: { base: 3, md: 8 } }
            : galleryConfig[size])}
        >
          {images.map((image, index) => (
            <AspectRatio ratio={1}>
              <ImageCard
                key={image.localFile.publicURL}
                image={image}
                // {...galleryCardConfig[size]}
                h="full"
                w="full"
              />
            </AspectRatio>
          ))}
        </SimpleGrid>
      </SRLWrapper>
    </SimpleReactLightbox>
  );
};
