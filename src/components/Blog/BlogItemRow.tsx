import { Box, HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";
import { BsPerson } from "react-icons/bs";
import { IconDate } from "../Shared/IconDate/IconDate";
import { IconText } from "../Shared/IconText/IconText";
import { LinkButton } from "../Shared/LinkButton/LinkButton";
import { Subheading } from "../Shared/Subheading/Subheading";
import { BlogItemColumnProps } from "./BlogItemColumn";

export const BlogItemRow = (props: BlogItemColumnProps) => {
  const { img, title, author, date, href, content, ...restOfProps } = props;
  const extractedImage = getImage(img.localFile);

  return (
    <Box w="full" mt={4} {...restOfProps}>
      <SimpleGrid columns={2}>
        {extractedImage && <GatsbyImage image={extractedImage} alt={title} />}
        <Stack
          w="full"
          px={10}
          spacing={4}
          py={6}
          border="1px"
          borderColor="gray.200"
          borderLeft={"none"}
        >
          <Box>
            <Subheading color="darkGray">{title}</Subheading>
            <HStack spacing={8}>
              {author && <IconText icon={<BsPerson />} text={author} />}
              <IconDate dateStr={date} />
            </HStack>
          </Box>
          <Text marginY={3} noOfLines={7} textAlign={"justify"}>
            {content}
          </Text>
          <LinkButton children="Čítaj ďalej" to={href} alignSelf={"flex-end"} />
        </Stack>
      </SimpleGrid>
    </Box>
  );
};
