import {
  Box,
  Container,
  GridItem,
  Image,
  SimpleGrid,
  Stack,
  Text
} from "@chakra-ui/react";
import React from "react";
import { TextAndPicProps } from "../../../lib/features/page/content-sections.d.";

const TextAndPic = (props: TextAndPicProps) => {
  console.log(props.direction)
  return (
    <Container maxW={"container.lg"}>
      <Stack spacing={{ base: 8, md: 10 }} py={20}>
        <Stack spacing={4}>
          <Box>
            <Box>
              <SimpleGrid columns={12} >
                <GridItem colSpan={{ base: 12, md: 6 }} width="100%">
                  <Image src={props.img_src} width="100%" pr={{ base: 0, md: 7 }}/>
                </GridItem>

                <GridItem
                  colSpan={{ base: 12, md: 6 }}
                  mt={6}
                  max-width="100%"
                  flexDir="column"
                  gridRowStart={props.direction==1? props.direction:undefined}
                >
                  <Text fontWeight={600} fontSize="xx-large">{props.heading}</Text>
                  <Text fontSize="xl">{props.text}</Text>
                </GridItem>
              </SimpleGrid>
            </Box>
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
};

export default TextAndPic;
