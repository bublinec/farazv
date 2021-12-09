import { SimpleGrid } from "@chakra-ui/react";
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

export const galleryCardConfig = {
  base: {
    h: {
      base: "36",
      sm: "52",
      md: "72",
      lg: "350px"
    }
  },
  large: {
    h: {
      base: "44",
      sm: "52",
      md: "72",
      lg: "280px"
    }
  }
};

export const UniversalGallery = (props: UniversalGalleryProps) => {
  const { galleryKey, images } = props;
  // const size = images.length > 12 ? "large" : "base";
  const size = "large";

  return (
    <SimpleReactLightbox>
      <SRLWrapper key={galleryKey}>
        <SimpleGrid {...galleryConfig[size]}>
          {images.map((image, index) => (
            <ImageCard
              key={image.localFile.publicURL}
              {...galleryCardConfig[size]}
              {...image}
            />
          ))}
        </SimpleGrid>
      </SRLWrapper>
    </SimpleReactLightbox>
  );
};
