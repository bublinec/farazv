import { Box, Flex, HStack, Stack } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import React from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { convertImage } from "../../../lib/features/image/utils/imageUtils";
import {
  ButtonTypes,
  SlideProps
} from "../../../lib/features/page/content-sections.d";
import { CarouselArrow } from "../../Home/MassTimesCarousel/CarouselArrow";
import { Container } from "../../Shared/Container/Container";
import { LinkButton } from "../../Shared/LinkButton/LinkButton";
import { Overlay } from "../../Shared/Overlay/Overlay";
import { Text } from "../Text/Text";

export const Slide = (props: SlideProps) => {
  const { image, buttons, heading, next, prev, ...restOfProps } = props;
  const bgImage = convertImage(image);

  return (
    <Box {...restOfProps}>
      {bgImage && (
        <BackgroundImage {...bgImage} preserveStackingContext>
          <Overlay zIndex={0} opacity={70} />
          <Container position="relative" h={400}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              w="full"
              h="full"
            >
              <CarouselArrow icon={<BsChevronLeft />} onClick={prev} />
              <Stack
                alignItems="center"
                justifyContent={"center"}
                spacing={8}
                h="full"
              >
                <Text
                  {...heading}
                  light
                  alignItems="center"
                  textAlign={"center"}
                  maxW={{ base: 96, md: 560 }}
                />
                <HStack spacing={4}>
                  {buttons.map((button) => (
                    <LinkButton
                      to={button.link}
                      external={button.external}
                      alignSelf={"center"}
                      buttonProps={{
                        buttonType: button.type || ButtonTypes.secondary
                      }}
                    >
                      {button.text}
                    </LinkButton>
                  ))}
                </HStack>
              </Stack>
              <CarouselArrow icon={<BsChevronRight />} onClick={next} />
            </Flex>
          </Container>
        </BackgroundImage>
      )}
    </Box>
  );
};
