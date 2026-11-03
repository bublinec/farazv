import { Box, Flex, HStack, Stack, useBreakpointValue } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import React from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { convertImage } from "../../../lib/features/image/utils/imageUtils";
import {
  ButtonTypes,
  SlideProps
} from "../../../lib/features/page/content-sections.d";
import { Container } from "../../Shared/Container/Container";
import { LinkButton } from "../../Shared/LinkButton/LinkButton";
import { Overlay } from "../../Shared/Overlay/Overlay";
import { Text } from "../Text/Text";
import { CarouselArrow } from "./CarouselArrow";

export const Slide = (props: SlideProps) => {
  const { image, buttons, heading, next, prev, ...restOfProps } = props;
  const bgImage = convertImage(image);
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });
  if (!React) {
    return;
  }

  return (
    <Box {...restOfProps}>
      {bgImage && (
        <BackgroundImage {...bgImage} preserveStackingContext>
          <Overlay zIndex={0} opacity={60} />
          <Container position="relative" h={{ base: 660, md: 560 }}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              w="full"
              h="full"
            >
              <CarouselArrow
                icon={<BsChevronLeft />}
                onClick={prev}
                display={{ base: "none", md: "block" }}
              />
              <Stack
                py={20}
                alignItems="center"
                justifyContent={"center"}
                spacing={{ base: 3, md: 2 }}
                h="full"
                flex={1}
              >
                <Text
                  {...heading}
                  light
                  alignItems="center"
                  textAlign={"center"}
                  maxW={{ base: "full", md: 720 }}
                />
                <HStack spacing={4}>
                  {buttons.map((button) => (
                    <>
                      <LinkButton
                        to={button.link}
                        external={button.external}
                        alignSelf={"center"}
                        buttonProps={{
                          size: buttonSize,
                          buttonType: button.type || ButtonTypes.secondary
                        }}
                      >
                        {button.text}
                      </LinkButton>
                    </>
                  ))}
                </HStack>
              </Stack>
              <CarouselArrow
                icon={<BsChevronRight />}
                onClick={next}
                display={{ base: "none", md: "block" }}
              />
            </Flex>
          </Container>
        </BackgroundImage>
      )}
    </Box>
  );
};
