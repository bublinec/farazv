import React from "react";
import SimpleReactLightbox, { SRLWrapper } from "simple-react-lightbox";
import { Image } from "../../../lib/features/image/model/image.model";
import { ImageCard } from "./components/ImageCard";

export interface UniversalGalleryProps {
  className?: string;
  galleryKey: string;
  images: Image[];
}

export const UniversalGallery = (props: UniversalGalleryProps) => {
  const { className = "", galleryKey, images } = props;
  return (
    <SimpleReactLightbox>
      <SRLWrapper key={galleryKey}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
          {images.map((image, index) => (
            <ImageCard
              key={image.localFile.publicURL}
              h={{
                base: "36",
                sm: "52",
                md: "72",
                lg: "350px"
              }}
              {...image}
            />
          ))}
        </div>
      </SRLWrapper>
    </SimpleReactLightbox>
  );
};
