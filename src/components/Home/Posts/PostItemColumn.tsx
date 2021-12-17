import { Box, BoxProps, HStack, Stack, Text } from "@chakra-ui/react";
import { Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";
import { BsPerson } from "react-icons/bs";
import { IconDate } from "../../Shared/IconDate/IconDate";
import { IconText } from "../../Shared/IconText/IconText";
import { Subheading } from "../../Shared/Subheading/Subheading";
import { PostLabel } from "./PostLabel";

export interface PostItemColumnProps extends BoxProps {
  img: any;
  title: string;
  author?: string;
  date: string;
  content: string;
  href: string;
}

export const PostItemColumn = (props: PostItemColumnProps) => {
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
    <Link to={href}>
      <Box
        w="full"
        bg="white"
        boxShadow="lg"
        _hover={{ boxShadow: "xl" }}
        {...restOfProps}
      >
        <Box>
          {extractedImage && <GatsbyImage image={extractedImage} alt={title} />}
          <PostLabel label="Aktuality" />
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
            <Subheading color="darkGray" fontSize={"xl"}>
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
          </Box>
        </Stack>
      </Box>
    </Link>
  );
};
