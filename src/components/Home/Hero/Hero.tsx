import { Box, Text } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import { getImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import React from "react";
import { Container } from "../../Shared/Container/Container";
import { Header } from "../../Shared/Header/Header";

export interface HeroProps {
  className?: string;
  image: any;
  title: string;
  subtitle: string;
}

export const Hero = (props: HeroProps) => {
  const { image, title, subtitle, className = "" } = props;

  const extractedImage = getImage(image.localFile);
  const bgImage = convertToBgImage(extractedImage);

  return (
    <section className={`${className}`}>
      <BackgroundImage {...bgImage} preserveStackingContext>
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black opacity-20"></div>
        <Header />
        <Container>
          <Box
            height={{
              base: "360px",
              lg: "580px"
            }}
            pb={{
              base: "20",
              lg: "32"
            }}
            w="full"
            className="flex flex-col items-center justify-center text-white z-10 relative text-center space-y-4 lg:space-y-3.5"
          >
            <Box
              as="h1"
              color="white"
              mt="2"
              lineHeight={{
                base: "40px",
                sm: "60px",
                lg: "initial"
              }}
              fontSize={{
                base: "4xl",
                sm: "4xl",
                md: "4xl",
                lg: "5xl",
                xl: "7xl"
              }}
              className="uppercase font-bold tracking-wider"
            >
              {title}
            </Box>
            <Text className="text-lightWhite md:w-8/12 md:text-3xl font-medium opacity-90">
              {subtitle}
            </Text>
          </Box>
        </Container>
      </BackgroundImage>
    </section>
  );
};
