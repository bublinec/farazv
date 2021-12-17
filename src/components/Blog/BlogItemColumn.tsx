import { Box, BoxProps, HStack, Stack, Text } from "@chakra-ui/react";
import { Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";
import { BsPerson } from "react-icons/bs";
import { PostLabel } from "../Home/Posts/PostLabel";
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
      boxShadow="lg"
      _hover={{ boxShadow: "xl" }}
      {...restOfProps}
    >
      <Link to={href}>
        <Box>
          {extractedImage && <GatsbyImage image={extractedImage} alt={title} />}
          <PostLabel label="Naše spoločenstvo" />
        </Box>
        <Stack
          w="full"
          spacing={0}
          p={5}
          alignItems="flex-start"
          border="1px"
          borderColor={borderColor}
          borderTop="none"
        >
          <Box>
            <Subheading color="darkGray" fontSize="2xl">
              {title}
            </Subheading>
            <HStack spacing={8}>
              {author && <IconText icon={<BsPerson />} text={author} />}
              <IconDate dateStr={date} />
            </HStack>
          </Box>
          <Box flex={1}>
            <Text
              marginY={3}
              noOfLines={6}
              fontWeight={400}
              textAlign={"justify"}
            >
              {content}
            </Text>
            {/* <LinkButton children="Čítaj ďalej" to={href} alignSelf={"flex-end"} /> */}
          </Box>
        </Stack>
      </Link>
    </Box>
  );
};
