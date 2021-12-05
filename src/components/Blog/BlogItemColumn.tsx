import { Box, BoxProps, HStack, Stack, Text } from "@chakra-ui/react";
import { Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";
import { BsPerson } from "react-icons/bs";
import { IconDate } from "../Shared/IconDate/IconDate";
import { IconText } from "../Shared/IconText/IconText";
import { Subheading } from "../Shared/Subheading/Subheading";

export interface BlogItemColumnProps extends BoxProps {
  img: any;
  title: string;
  author?: string;
  date: string;
  content: string;
  href: string;
}

export const BlogItemColumn = (props: BlogItemColumnProps) => {
  const {
    img,
    title,
    author,
    date,
    content,
    href,
    borderColor = "gray.200",
    ...restOfProps
  } = props;
  const extractedImage = getImage(img.localFile);

  return (
    <Box
      w="full"
      bg="white"
      {...restOfProps}
      boxShadow="lg"
      _hover={{ boxShadow: "xl" }}
    >
      <Link to={href}>
        {extractedImage && <GatsbyImage image={extractedImage} alt={title} />}
        <Stack
          w="full"
          spacing={4}
          p={5}
          pb={6}
          alignItems="flex-start"
          border="1px"
          borderColor={borderColor}
          borderTop="none"
        >
          <Box>
            <Subheading color="darkGray">{title}</Subheading>
            <HStack spacing={8}>
              {author && <IconText icon={<BsPerson />} text={author} />}
              <IconDate dateStr={date} />
            </HStack>
          </Box>
          <Text
            marginY={3}
            noOfLines={6}
            fontWeight={400}
            textAlign={"justify"}
          >
            {content}
          </Text>
          {/* <LinkButton children="Čítaj ďalej" to={href} alignSelf={"flex-end"} /> */}
        </Stack>
      </Link>
    </Box>
  );
};
