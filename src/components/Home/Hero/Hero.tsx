import { Box } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import { getImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import React, { useEffect, useState } from "react";
import { Container } from "../../Shared/Container/Container";
import { Header } from "../../Shared/Header/Header";
import { Overlay } from "../../Shared/Overlay/Overlay";
import { MassTimesCarousel } from "../MassTimesCarousel/MassTimesCarousel";

export const BROWSER_BAR_WIDTH = 48;

export interface HeroProps {
  className?: string;
  image: any;
  title: string;
  subtitle: string;
}

export const Hero = (props: HeroProps) => {
  const { image, title, subtitle } = props;
  const [height, setHeight] = useState(1000);

  useEffect(() => {
    setHeight(window.innerHeight - BROWSER_BAR_WIDTH);
  }, []);

  const extractedImage = getImage(image.localFile);
  const bgImage = convertToBgImage(extractedImage);

  return (
    <BackgroundImage {...bgImage} preserveStackingContext>
      <Overlay zIndex={0} opacity={75} />
      <Box>
        <Header />
        <Container position="relative">
          <Box
            height={{
              base: height,
              md: "630px"
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
