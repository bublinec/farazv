import { Box } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import { getImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import React from "react";
import { Container } from "../../Shared/Container/Container";
import { Header } from "../../Shared/Header/Header";
import { Overlay } from "../../Shared/Overlay/Overlay";
import { MassTimesCarousel } from "../MassTimesCarousel/MassTimesCarousel";

export interface HeroProps {
  className?: string;
  image: any;
  title: string;
  subtitle: string;
}

export const Hero = (props: HeroProps) => {
  const { image, title, subtitle } = props;

  const extractedImage = getImage(image.localFile);
  const bgImage = convertToBgImage(extractedImage);

  return (
    <BackgroundImage {...bgImage} preserveStackingContext>
      <Overlay zIndex={0} opacity={70} />
      <Box>
        <Header />
        <Container position="relative">
          <Box
            height={{
              base: "360px",
              lg: "640px"
            }}
            w="full"
          >
            <MassTimesCarousel />
          </Box>
        </Container>
      </Box>
    </BackgroundImage>
  );
};
