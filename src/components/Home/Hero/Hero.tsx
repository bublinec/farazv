import { Container } from "@/components/Shared/Container/Container";
import { Box, Text } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import { getImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import React from "react";
import { HeroCard } from "./components/HeroCard";
import { HeroSubscript } from "./components/HeroSubscript";
import { useHero } from "./hooks/useHero";

export interface HeroProps {
  className?: string;
}

export const Hero = (props: HeroProps) => {
  const { className = "" } = props;
  const { image, superscript, title, subtitle } = useHero();

  const extractedImage = getImage(image.localFile);
  const bgImage = convertToBgImage(extractedImage);

  return (
    <section className={`${className}`}>
      <BackgroundImage
        {...bgImage}
        className="z-10 relative"
        preserveStackingContext
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black opacity-60"></div>
        <Container>
          <Box
            height={{
              base: "500px",
              lg: "750px",
            }}
            pb={{
              base: "20",
              lg: "32",
            }}
            w="full"
            className="flex flex-col items-center justify-center text-white z-20 relative text-center space-y-4 lg:space-y-3.5"
          >
            <HeroSubscript>{superscript}</HeroSubscript>
            <Box
              as="h1"
              color="white"
              mt="2"
              lineHeight={{
                base: "40px",
                sm: "60px",
                lg: "initial",
              }}
              fontSize={{
                base: "4xl",
                sm: "5xl",
                md: "6xl",
                lg: "7xl",
                xl: "8xl",
              }}
              className="uppercase font-bold tracking-wider"
            >
              {title}
            </Box>
            <Text className="text-lightWhite md:w-8/12 md:text-xl font-medium opacity-90">
              {subtitle}
            </Text>
          </Box>
        </Container>
      </BackgroundImage>
      <HeroCard />
    </section>
  );
};
