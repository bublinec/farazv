import { Box } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import { getImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import React from "react";
import { Container } from "../Container/Container";
import { Header } from "../Header/Header";

export interface MiniHeroProps {
  className?: string;
  title?: string;
  image: any;
}

export const MiniHero = (props: MiniHeroProps) => {
  const { title, image, className = "" } = props;
  const extractedImage = getImage(image.localFile);
  const bgImage = convertToBgImage(extractedImage);

  return (
    <section className={`${className}`}>
      <BackgroundImage {...bgImage} preserveStackingContext>
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black opacity-40"></div>
        <Header />
        <Container>
          <Box
            height={{
              base: "240px",
              lg: "240px"
            }}
            pb={{
              base: "20",
              lg: "32"
            }}
            w="full"
            className="flex flex-col items-center text-white z-10 relative text-center space-y-4 lg:space-y-3.5"
          >
            <Box
              as="h1"
              color="white"
              mt={16}
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
                xl: "6xl"
              }}
              className="uppercase font-semibold tracking-wider"
            >
              {title}
            </Box>
          </Box>
        </Container>
      </BackgroundImage>
    </section>
  );
};
