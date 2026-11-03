import {
  Box,
  BoxProps,
  Center,
  GridItem,
  Link,
  SimpleGrid,
  Text
} from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import React from "react";
import { Image } from "../../lib/features/image/model/image.model";
import { convertImage } from "../../lib/features/image/utils/imageUtils";
import { Container } from "../Shared/Container/Container";
import { Overlay } from "../Shared/Overlay/Overlay";
import { Superscript } from "../Shared/Superscript/Superscript";

export interface LastPiecesProps extends BoxProps {
  description?: string;
  items: Array<{
    month: string;
    picture?: Image;
  }>;
  image: Image;
}

export const LastPieces = (props: LastPiecesProps) => {
  const { description, items, image, ...restOfProps } = props;

  const bgImage = convertImage(image);
  return (
    <Box {...restOfProps} py={4} h={500}>
      {bgImage && (
        <BackgroundImage {...bgImage} preserveStackingContext>
          <Overlay zIndex={0} opacity={60} />
          <Container>
            <Center flexDir="column" pt={6}>
              <Superscript color="secondary">Farnosť</Superscript>
              <Text fontSize="xl" color="white">
                Posledné čísla
              </Text>
              <Box
                h={0.5}
                w={60}
                backgroundColor="grey"
                borderRadius={6}
                mb={1}
              />
              <Box
                h={0.5}
                w={57}
                backgroundColor="grey"
                borderRadius={6}
                mb={3}
              />
              <Text maxW="400px" minH="60px" color="white">
                {props.description}
              </Text>
              <SimpleGrid spacing={5} py={5} columns={3} w="100%">
                {props.items.slice(0, 3).map((item) => {
                  return (
                    <GridItem backgroundColor="grey" colSpan={1} h={96}>
                      <Link href={`${window.location.pathname}/${item.month}`}>
                        <Text
                          mt="200px"
                          w="100%"
                          h={12}
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          fontSize="xl"
                          color="black"
                          backgroundColor="rgba(0,0,0,0.5)"
                        >
                          {item.month}
                        </Text>
                      </Link>
                    </GridItem>
                  );
                })}
              </SimpleGrid>
            </Center>
          </Container>
        </BackgroundImage>
      )}
    </Box>
  );

  return (
    <Box
      w="100%"
      h="450px"
      backgroundColor="black"
      mb={20}
      display={{ md: "grid", base: "none" }}
    ></Box>
  );
};
