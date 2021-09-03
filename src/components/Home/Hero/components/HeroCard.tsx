import { Box } from "@chakra-ui/react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";
import { useHeroCard } from "../hooks/useHeroCard";
import { HeroCardTitle } from "./HeroCardTitle";

export interface HeroCardProps {
  className?: string;
}

export const HeroCard = (props: HeroCardProps) => {
  const { className = "" } = props;
  const { title, text, image } = useHeroCard();

  return (
    <div className="herocard bg-white rounded-md mx-10 xl:w-10/12 2xl:w-8/12 shadow-lg xl:mx-auto relative -mt-20 z-40 flex overflow-hidden">
      <div className="detail lg:w-1/2 p-10 lg:p-16 flex flex-col">
        <header>
          <HeroCardTitle>{title}</HeroCardTitle>
        </header>
        <div className="flex flex-1 items-center">
          <p className="mt-10 lg:mt-4 leading-7 text-trueGray-600">{text}</p>
        </div>
      </div>
      <Box className="image w-1/2 hidden lg:flex" maxH="500px">
        <GatsbyImage
          className="h-full w-full"
          alt={image.alternativeText}
          image={getImage(image.localFile)}
        />
      </Box>
    </div>
  );
};
